import { newMutation, addGraphQLMutation, addGraphQLResolvers } from '../vulcan-lib';
import { Tags } from '../../lib/collections/tags/collection';
import { TagRels } from '../../lib/collections/tagRels/collection';
import { Posts } from '../../lib/collections/posts/collection';
import { performVoteServer } from '../voteServer';
import { accessFilterSingle } from '../../lib/utils/schemaUtils';

const addOrUpvoteTag = async ({tagId, postId, currentUser, context}: {
  tagId: string,
  postId: string,
  currentUser: DbUser,
  context: ResolverContext,
}): Promise<any> => {
  // Validate that tagId and postId refer to valid non-deleted documents
  // and that this user can see both.
  const post = Posts.findOne({_id: postId});
  const tag = Tags.findOne({_id: tagId});
  if (!await accessFilterSingle(currentUser, Posts, post, context))
    throw new Error(`Invalid postId ${postId}, either this post does not exist, or you do not have access`);
  if (!await accessFilterSingle(currentUser, Tags, tag, context))
    throw new Error(`Invalid tagId ${tagId}, either this tag does not exist, or you do not have access`);
  
  // Check whether this document already has this tag applied
  const existingTagRel = TagRels.findOne({ tagId, postId });
  if (!existingTagRel) {
    const tagRel = await newMutation({
      collection: TagRels,
      document: { tagId, postId, userId: currentUser._id },
      validate: false,
      currentUser,
    });
    return tagRel.data;
  } else {
    // Upvote the tag
    // TODO: Don't *remove* an upvote in this case
    const votedTagRel = await performVoteServer({
      document: existingTagRel,
      voteType: 'smallUpvote',
      collection: TagRels,
      user: currentUser,
      toggleIfAlreadyVoted: false,
    });
    return votedTagRel;
  }
}

addGraphQLResolvers({
  Mutation: {
    addOrUpvoteTag: async (root, { tagId, postId }, context: ResolverContext) => {
      const { currentUser } = context;
      if (!currentUser) throw new Error("You must be logged in to tag");
      if (!postId) throw new Error("Missing argument: postId");
      if (!tagId) throw new Error("Missing argument: tagId");
      
      return addOrUpvoteTag({tagId, postId, currentUser, context});
    },
    
    addTags: async (root, {postId, tagIds}: {postId: string, tagIds: Array<string>}, context: ResolverContext) => {
      const { currentUser } = context;
      if (!currentUser) throw new Error("You must be logged in to tag");
      if (!postId) throw new Error("Missing argument: postId");
      if (!tagIds) throw new Error("Missing argument: tagIds");
      
      await Promise.all(tagIds.map(tagId =>
        addOrUpvoteTag({ tagId, postId, currentUser, context })
      ));
      
      return true;
    },
  }
});
addGraphQLMutation('addOrUpvoteTag(tagId: String, postId: String): TagRel');
addGraphQLMutation('addTags(postId: String, tagIds: [String]): Boolean');
