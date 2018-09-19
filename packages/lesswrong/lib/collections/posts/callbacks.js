import { addCallback, runCallbacks, runCallbacksAsync } from 'meteor/vulcan:core';
import { Posts } from 'meteor/example-forum';
import Users from 'meteor/vulcan:users';
import { performVoteServer } from 'meteor/vulcan:voting';
import Localgroups from '../localgroups/collection.js';


function PostsEditRunPostUndraftedSyncCallbacks (modifier, post) {
  if (modifier.$set && modifier.$set.draft === false && post.draft) {
    modifier = runCallbacks("posts.undraft.sync", modifier, post);
  }
  return modifier;
}
addCallback("posts.edit.sync", PostsEditRunPostUndraftedSyncCallbacks);

function PostsEditRunPostUndraftedAsyncCallbacks (newPost, oldPost) {
  if (!newPost.draft && oldPost.draft) {
    runCallbacksAsync("posts.undraft.async", newPost, oldPost)
  }
  return newPost
}
addCallback("posts.edit.async", PostsEditRunPostUndraftedAsyncCallbacks);

function PostsEditRunPostDraftedAsyncCallbacks (newPost, oldPost) {
  if (newPost.draft && !oldPost.draft) {
    runCallbacksAsync("posts.draft.async", newPost, oldPost)
  }
  return newPost
}
addCallback("posts.edit.async", PostsEditRunPostDraftedAsyncCallbacks);

/**
 * @summary set postedAt when a post is moved out of drafts
 */
function PostsSetPostedAt (modifier, post) {
  modifier.$set.postedAt = new Date();
  if (modifier.$unset) {
    delete modifier.$unset.postedAt;
  }
  return modifier;
}
addCallback("posts.undraft.sync", PostsSetPostedAt);

/**
 * @summary increment postCount when post is undrafted
 */
function postsUndraftIncrementPostCount (post, oldPost) {
  Users.update({_id: post.userId}, {$inc: {postCount: 1}})
}
addCallback("posts.undraft.async", postsUndraftIncrementPostCount);

/**
 * @summary decrement postCount when post is drafted
 */
function postsDraftDecrementPostCount (post, oldPost) {
  Users.update({_id: post.userId}, {$inc: {postCount: -1}})
}
addCallback("posts.draft.async", postsDraftDecrementPostCount);

/**
 * @summary update frontpagePostCount when post is moved into frontpage
 */
function postsEditIncreaseFrontpagePostCount (post, oldPost) {
  if (post.frontpageDate && !oldPost.frontpageDate) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: 1}})
  }
}
addCallback("posts.edit.async", postsEditIncreaseFrontpagePostCount);

/**
 * @summary update frontpagePostCount when post is moved into frontpage
 */
function postsNewIncreaseFrontpageCount (post) {
  if (post.frontpageDate) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: 1}})
  }
}
addCallback("posts.new.async", postsNewIncreaseFrontpageCount);

/**
 * @summary update frontpagePostCount when post is moved into frontpage
 */
function postsRemoveDecreaseFrontpageCount (post) {
  if (post.frontpageDate) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: -1}})
  }
}
addCallback("posts.remove.async", postsRemoveDecreaseFrontpageCount);

/**
 * @summary update frontpagePostCount when post is moved out of frontpage
 */
function postsEditDecreaseFrontpagePostCount (post, oldPost) {
  if (!post.frontpageDate && oldPost.frontpageDate) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: -1}})
  }
}
addCallback("posts.edit.async", postsEditDecreaseFrontpagePostCount);



function increaseMaxBaseScore ({newDocument, vote}, collection, user, context) {
  if (vote.collectionName === "Posts" && newDocument.baseScore > (newDocument.maxBaseScore || 0)) {
    let thresholdTimestamp = {};
    if (!newDocument.scoreExceeded2Date && newDocument.baseScore >= 2) {
      thresholdTimestamp.scoreExceeded2Date = new Date();
    }
    if (!newDocument.scoreExceeded30Date && newDocument.baseScore >= 30) {
      thresholdTimestamp.scoreExceeded30 = new Date();
    }
    if (!newDocument.scoreExceeded45Date && newDocument.baseScore >= 45) {
      thresholdTimestamp.scoreExceeded45Date = new Date();
    }
    if (!newDocument.scoreExceeded75Date && newDocument.baseScore >= 75) {
      thresholdTimestamp.scoreExceeded75Date = new Date();
    }
    Posts.update({_id: newDocument._id}, {$set: {maxBaseScore: newDocument.baseScore, ...thresholdTimestamp}})
  }
}

addCallback("votes.smallUpvote.async", increaseMaxBaseScore);
addCallback("votes.bigUpvote.async", increaseMaxBaseScore);

function PostsNewDefaultLocation (post) {
  if (post.isEvent && post.groupId && !post.location) {
    const { location, googleLocation, mongoLocation } = Localgroups.findOne(post.groupId)
    post = {...post, location, googleLocation, mongoLocation}
  }
  return post
}

addCallback("posts.new.sync", PostsNewDefaultLocation);

function PostsNewDefaultTypes (post) {
  if (post.isEvent && post.groupId && !post.types) {
    const { types } = Localgroups.findOne(post.groupId)
    post = {...post, types}
  }
  return post
}

addCallback("posts.new.sync", PostsNewDefaultTypes);

// LESSWRONG – bigUpvote
async function LWPostsNewUpvoteOwnPost(post) {
 var postAuthor = Users.findOne(post.userId);
 const votedPost = await performVoteServer({ document: post, voteType: 'bigUpvote', collection: Posts, user: postAuthor })
 return {...post, ...votedPost};
}

addCallback('posts.new.after', LWPostsNewUpvoteOwnPost);
