import * as _ from 'underscore';
import { Posts } from '../lib/collections/posts';
import { ensureIndex } from '../lib/collectionUtils';
import { accessFilterMultiple } from '../lib/utils/schemaUtils';
import { setUserPartiallyReadSequences } from './partiallyReadSequences';
import { addGraphQLMutation, addGraphQLQuery, addGraphQLResolvers, addGraphQLSchema } from './vulcan-lib';
import { WeightedList } from './weightedList';
import type { RecommendationsAlgorithm } from '../lib/collections/users/recommendationSettings';


const MINIMUM_BASE_SCORE = 50

// The set of fields on Posts which are used for deciding which posts to
// recommend. Fields other than these will be projected out before downloading
// from the database.
const scoreRelevantFields = {baseScore:1, curatedDate:1, frontpageDate:1, defaultRecommendation: 1};


// Returns part of a mongodb aggregate pipeline, which will join against the
// ReadStatuses collection and filter out any posts which have been read by the
// current user. Returns as an array, so you can spread this into a pipeline
// with ...pipelineFilterUnread(currentUser). If currentUser is null, returns
// an empty array (no aggregation pipeline stages), so all posts are included.
const pipelineFilterUnread = ({currentUser}: {
  currentUser: DbUser|null
}) => {
  if (!currentUser)
    return [];

  return [
    { $lookup: {
      from: "readstatuses",
      let: { documentId: "$_id", },
      pipeline: [
        { $match: {
          userId: currentUser._id,
        } },
        { $match: { $expr: {
          $and: [
            {$eq: ["$postId", "$$documentId"]},
          ]
        } } },
        { $limit: 1},
      ],
      as: "views",
    } },

    { $match: {
      "views": {$size:0}
    } },
  ];
}

// Given an algorithm with a set of inclusion criteria, return a mongoDB
// selector that only allows the included posts
//
// You can think of what it's doing is taking the inclusion criteria, figuring
// out what's *not* included, and then writing an inclusion selector that
// excludes what's not desired.
//
// Wait, I hear you say. This isn't elegant at all. Like, surely there's a way
// to define a table of possible exclusion criteria and you can
// deterministically combine them without writing out each individual case
// combinatorially. . ... Yeah .... Sometimes life is hard.
const getInclusionSelector = (algorithm: RecommendationsAlgorithm) => {
  if (algorithm.coronavirus) {
    return {
      ["tagRelevance.tNsqhzTibgGJKPEWB"]: {$gte: 1},
      question: true
    }
  }
  if (algorithm.reviewReviews) {
    return {
      [algorithm.reviewReviews === 2018 ? "nominationCount2018" : "nominationCount2019"]: {$gte: 2}
    }
  }
  if ([2018, 2019].includes(algorithm.reviewNominations || 0)) {
    return {
      postedAt: {$gt: new Date(`${algorithm.reviewNominations}-01-01`), $lt: new Date(`${(algorithm.reviewNominations as number) + 1}-01-01`)},
      meta: false
    }
  }
  if (algorithm.includePersonal) {
    if (algorithm.includeMeta) {
      return {}
    }
    return {meta: false}
  }
  if (algorithm.includeMeta) {
    return {$or: [{frontpageDate: {$exists: true}}, {meta: true}]}
  }
  return {$and: [{frontpageDate: {$exists: true}}, {meta: false}]}
}

// A filter (mongodb selector) for which posts should be considered at all as
// recommendations.
const recommendablePostFilter = (algorithm: RecommendationsAlgorithm) => {
  const recommendationFilter = {
    // Gets the selector from the default Posts view, which includes things like
    // excluding drafts and deleted posts
    ...Posts.getParameters({}).selector,

    // Only consider recommending posts if they hit the minimum base score. This has a big
    // effect on the size of the recommendable-post set, which needs to not be
    // too big for performance reasons.
    baseScore: {$gt: algorithm.minimumBaseScore || MINIMUM_BASE_SCORE},

    ...getInclusionSelector(algorithm),

    // Enforce the disableRecommendation flag
    disableRecommendation: {$ne: true},
  }
  
  if (algorithm.excludeDefaultRecommendations) {
    return recommendationFilter
  } else {
    return {$or: [recommendationFilter, { defaultRecommendation: true}]}
  }
}

ensureIndex(Posts, {defaultRecommendation: 1})

// Return the set of all posts that are eligible for being recommended, with
// scoreRelevantFields included (but other fields projected away). If
// onlyUnread is true and currentUser is nonnull, posts that the user has
// already read are filtered out.
const allRecommendablePosts = async ({currentUser, algorithm}: {
  currentUser: DbUser|null,
  algorithm: RecommendationsAlgorithm,
}): Promise<Array<DbPost>> => {
  return await Posts.aggregate([
    // Filter to recommendable posts
    { $match: {
      ...recommendablePostFilter(algorithm),
    } },

    // If onlyUnread, filter to just unread posts
    ...(algorithm.onlyUnread ? pipelineFilterUnread({currentUser}) : []),

    // Project out fields other than _id and scoreRelevantFields
    { $project: {_id:1, ...scoreRelevantFields} },
  ]).toArray();
}

// Returns the top-rated posts (rated by scoreFn) to recommend to a user.
//   count: The maximum number of posts to return. May return fewer, if there
//     aren't enough recommendable unread posts in the database.
//   currentUser: The user who is requesting the recommendations, or null if
//     logged out.
//   algorithm: Used for inclusion criteria
//   scoreFn: Function which takes a post (with at least scoreRelevantFields
//     included), and returns a number. The posts with the highest scoreFn
//     return value will be the ones returned.
const topPosts = async ({count, currentUser, algorithm, scoreFn}: {
  count: number,
  currentUser: DbUser|null,
  algorithm: RecommendationsAlgorithm,
  scoreFn: (post: DbPost)=>number,
}) => {
  const recommendablePostsMetadata  = await allRecommendablePosts({currentUser, algorithm});

  const defaultRecommendations = algorithm.excludeDefaultRecommendations ? [] : recommendablePostsMetadata.filter(p=> !!p.defaultRecommendation)

  const sortedTopRecommendations = _.sortBy(recommendablePostsMetadata, post => -scoreFn(post))
  const unreadTopPosts = _.first([
    ...defaultRecommendations,
    ...sortedTopRecommendations
  ], count)
  const unreadTopPostIds = _.map(unreadTopPosts, p=>p._id)

  return await Posts.find(
    { _id: {$in: unreadTopPostIds} },
    { sort: {defaultRecommendation: -1, baseScore: -1} }
  ).fetch();
}

// Returns a random weighted sampling of highly-rated posts (weighted by
// sampleWeightFn) to recommend to a user.
//
//   count: The maximum number of posts to return. May return fewer, if there
//     aren't enough recommendable unread posts in the database.
//   currentUser: The user who is requesting the recommendations, or null if
//     logged out.
//   algorithm: Used for inclusion criteria
//   sampleWeightFn: Function which takes a post (with at least
//     scoreRelevantFields included), and returns a number. Higher numbers are
//     more likely to be recommended.
const samplePosts = async ({count, currentUser, algorithm, sampleWeightFn}: {
  count: number,
  currentUser: DbUser|null,
  algorithm: RecommendationsAlgorithm,
  sampleWeightFn: (post: DbPost)=>number,
}) => {
  const recommendablePostsMetadata  = await allRecommendablePosts({currentUser, algorithm});

  const numPostsToReturn = Math.max(0, Math.min(recommendablePostsMetadata.length, count))

  const defaultRecommendations = algorithm.excludeDefaultRecommendations ? [] : recommendablePostsMetadata.filter(p=> !!p.defaultRecommendation).map(p=>p._id)

  const sampledPosts = new WeightedList(
    _.map(recommendablePostsMetadata, post => [post._id, sampleWeightFn(post)])
  ).pop(Math.max(numPostsToReturn - defaultRecommendations.length, 0))

  const recommendedPosts = _.first([...defaultRecommendations, ...sampledPosts], numPostsToReturn)

  return await Posts.find(
    { _id: {$in: recommendedPosts} },
    { sort: {defaultRecommendation: -1} }
  ).fetch();
}

const getModifierName = (post: DbPost) => {
  if (post.curatedDate) return 'curatedModifier'
  if (post.frontpageDate) return 'frontpageModifier'
  return 'personalBlogpostModifier'
}

const getRecommendedPosts = async ({count, algorithm, currentUser}: {
  count: number,
  algorithm: RecommendationsAlgorithm,
  currentUser: DbUser|null
}) => {
  const scoreFn = (post: DbPost) => {
    const sectionModifier = algorithm[getModifierName(post)]||0;
    const weight = sectionModifier + Math.pow(post.baseScore - algorithm.scoreOffset, algorithm.scoreExponent)
    return Math.max(0, weight);
  }

  // Cases here should match recommendationAlgorithms in RecommendationsAlgorithmPicker.jsx
  switch(algorithm.method) {
    case "top": {
      return await topPosts({
        count, currentUser, algorithm,
        scoreFn
      });
    }
    case "sample": {
      return await samplePosts({
        count, currentUser, algorithm,
        sampleWeightFn: scoreFn,
      });
    }
    default: {
      throw new Error(`Unrecognized recommendation algorithm: ${algorithm.method}`);
    }
  }
};

const getDefaultResumeSequence = (): Array<{collectionId: string, nextPostId: string}> => {
  return [
    {
      // HPMOR
      collectionId: "ywQvGBSojSQZTMpLh",
      nextPostId: "vNHf7dx5QZA4SLSZb",
    },
    {
      // Codex
      collectionId: "2izXHCrmJ684AnZ5X",
      nextPostId: "gFMH3Cqw4XxwL69iy",
    },
    {
      // R:A-Z
      collectionId: "oneQyj4pw77ynzwAF",
      nextPostId: "2ftJ38y9SRBCBsCzy",
    },
  ]
}

const getResumeSequences = async (currentUser: DbUser|null, context: ResolverContext) => {
  const sequences = currentUser ? currentUser.partiallyReadSequences : getDefaultResumeSequence()

  if (!sequences)
    return [];

  const results = await Promise.all(_.map(sequences,
    async (partiallyReadSequence: any) => {
      const { sequenceId, collectionId, nextPostId, numRead, numTotal, lastReadTime } = partiallyReadSequence;
      return {
        sequence: sequenceId
          ? await context.loaders.Sequences.load(sequenceId)
          : null,
        collection: collectionId
          ? await context.loaders.Collections.load(collectionId)
          : null,
        nextPost: await context.loaders.Posts.load(nextPostId),
        numRead: numRead,
        numTotal: numTotal,
        lastReadTime: lastReadTime,
      }
    }
  ));
  
  // Filter out results where nextPost is null. (Specifically, this filters out
  // the default sequences on dev databases, which would otherwise cause a crash
  // down the line.)
  return _.filter(results, result=>!!result.nextPost);
}


addGraphQLResolvers({
  Query: {
    async ContinueReading(root: void, args: void, context: ResolverContext) {
      const { currentUser } = context;

      return await getResumeSequences(currentUser, context);
    },

    async Recommendations(root: void, {count,algorithm}: {count: number, algorithm: RecommendationsAlgorithm}, context: ResolverContext) {
      const { currentUser } = context;
      const recommendedPosts = await getRecommendedPosts({count, algorithm, currentUser})
      const accessFilteredPosts = await accessFilterMultiple(currentUser, Posts, recommendedPosts, context);
      if (recommendedPosts.length !== accessFilteredPosts.length) {
        // eslint-disable-next-line no-console
        console.error("Recommendation engine returned a post which permissions filtered out as inaccessible");
      }
      return accessFilteredPosts;
    }
  },
  Mutation: {
    async dismissRecommendation(root: void, {postId}: {postId: string}, context: ResolverContext) {
      const { currentUser } = context;
      if (!currentUser) return false;

      if (_.some(currentUser.partiallyReadSequences, (s:any)=>s.nextPostId===postId)) {
        const newPartiallyRead = _.filter(currentUser.partiallyReadSequences,
          (s:any)=>s.nextPostId !== postId);
        await setUserPartiallyReadSequences(currentUser._id, newPartiallyRead);
        return true;
      }
      return false;
    }
  },
});

addGraphQLSchema(`
  type RecommendResumeSequence {
    sequence: Sequence
    collection: Collection
    nextPost: Post!
    numRead: Int
    numTotal: Int
    lastReadTime: Date
  }
`);

addGraphQLQuery("ContinueReading: [RecommendResumeSequence!]");
addGraphQLQuery("Recommendations(count: Int, algorithm: JSON): [Post!]");
addGraphQLMutation("dismissRecommendation(postId: String): Boolean");
