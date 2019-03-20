import { Posts } from "../posts";
import { Comments } from './collection'
import { addCallback, runCallbacksAsync, newMutation, editMutation, removeMutation, registerSetting, getSetting, Utils } from 'meteor/vulcan:core';
import Users from "meteor/vulcan:users";
import { performVoteServer } from '../../../server/voteServer.js';
import { createError } from 'apollo-errors';
import Messages from '../messages/collection.js';
import Conversations from '../conversations/collection.js';

import { addEditableCallbacks } from '../../../server/editor/make_editable_callbacks.js'
import { makeEditableOptions } from './custom_fields.js'

const getLessWrongAccount = async () => {
  let account = Users.findOne({username: "AdminTeam"});
  if (!account) {
    const userData = {
      // TODO nicer solution
      username: "AdminTeam",
      email: "forum@effectivealtruism.org",
    }
    account = await newMutation({
      collection: Users,
      document: userData,
      validate: false,
    })
    return account.data
  }
  return account;
}

// EXAMPLE-FORUM CALLBACKS:

//////////////////////////////////////////////////////
// comments.new.sync                                //
//////////////////////////////////////////////////////

function CommentsNewOperations (comment) {

  var userId = comment.userId;

  // increment comment count
  Users.update({_id: userId}, {
    $inc:       {'commentCount': 1}
  });

  // update post
  Posts.update(comment.postId, {
    $inc:       {commentCount: 1},
    $set:       {lastCommentedAt: new Date()},
    $addToSet:  {commenters: userId}
  });

  return comment;
}
addCallback('comments.new.sync', CommentsNewOperations);

//////////////////////////////////////////////////////
// comments.new.async                               //
//////////////////////////////////////////////////////


/**
 * @summary Run the 'upvote.async' callbacks *once* the item exists in the database
 * @param {object} item - The item being operated on
 * @param {object} user - The user doing the operation
 * @param {object} collection - The collection the item belongs to
 */
function UpvoteAsyncCallbacksAfterDocumentInsert(item, user, collection) {
  runCallbacksAsync('upvote.async', item, user, collection, 'upvote');
}
addCallback('comments.new.async', UpvoteAsyncCallbacksAfterDocumentInsert);

//////////////////////////////////////////////////////
// comments.remove.async                            //
//////////////////////////////////////////////////////

function CommentsRemovePostCommenters (comment, currentUser) {
  const { userId, postId } = comment;

  // dec user's comment count
  Users.update({_id: userId}, {
    $inc: {'commentCount': -1}
  });

  const postComments = Comments.find({postId}, {sort: {postedAt: -1}}).fetch();

  const commenters = _.uniq(postComments.map(comment => comment.userId));
  const lastCommentedAt = postComments[0] && postComments[0].postedAt;

  // update post with a decremented comment count, a unique list of commenters and corresponding last commented at date
  Posts.update(postId, {
    $inc: {commentCount: -1},
    $set: {lastCommentedAt, commenters},
  });

  return comment;
}
addCallback('comments.remove.async', CommentsRemovePostCommenters);

function CommentsRemoveChildrenComments (comment, currentUser) {

  const childrenComments = Comments.find({parentCommentId: comment._id}).fetch();

  childrenComments.forEach(childComment => {
    removeMutation({
      action: 'comments.remove',
      collection: Comments,
      documentId: childComment._id,
      currentUser: currentUser,
      validate: false
    });
  });

  return comment;
}
addCallback('comments.remove.async', CommentsRemoveChildrenComments);

//////////////////////////////////////////////////////
// other                                            //
//////////////////////////////////////////////////////

function AddReferrerToComment(comment, properties)
{
  if (properties && properties.context && properties.context.headers) {
    let referrer = properties.context.headers["referer"];
    let userAgent = properties.context.headers["user-agent"];
    
    return {
      ...comment,
      referrer: referrer,
      userAgent: userAgent,
    };
  }
}
addCallback("comment.create.before", AddReferrerToComment);


function UsersRemoveDeleteComments (user, options) {
  if (options.deleteComments) {
    Comments.remove({userId: user._id});
  } else {
    // not sure if anything should be done in that scenario yet
    // Comments.update({userId: userId}, {$set: {author: '\[deleted\]'}}, {multi: true});
  }
}
addCallback('users.remove.async', UsersRemoveDeleteComments);

registerSetting('forum.commentInterval', 15, 'How long users should wait in between comments (in seconds)');

function CommentsNewRateLimit (comment, user) {
  if (!Users.isAdmin(user)) {
    const timeSinceLastComment = Users.timeSinceLast(user, Comments);
    const commentInterval = Math.abs(parseInt(getSetting('forum.commentInterval',15)));

    // check that user waits more than 15 seconds between comments
    if((timeSinceLastComment < commentInterval)) {
      throw new Error(Utils.encodeIntlError({id: 'comments.rate_limit_error', value: commentInterval-timeSinceLastComment}));
    }
  }
  return comment;
}
addCallback('comments.new.validate', CommentsNewRateLimit);


//////////////////////////////////////////////////////
// LessWrong callbacks                              //
//////////////////////////////////////////////////////

function CommentsEditSoftDeleteCallback (comment, oldComment) {
  if (comment.deleted && !oldComment.deleted) {
    runCallbacksAsync('comments.moderate.async', comment);
  }
}
addCallback("comments.edit.async", CommentsEditSoftDeleteCallback);

function ModerateCommentsPostUpdate (comment, oldComment) {
  const comments = Comments.find({postId:comment.postId, deleted: false}).fetch()

  const lastComment = _.max(comments, (c) => c.postedAt)
  const lastCommentedAt = (lastComment && lastComment.postedAt) || Posts.findOne({_id:comment.postId}).postedAt

  editMutation({
    collection:Posts,
    documentId: comment.postId,
    set: {
      lastCommentedAt:new Date(lastCommentedAt),
      commentCount:comments.length
    },
    unset: {},
    validate: false,
  })
}
addCallback("comments.moderate.async", ModerateCommentsPostUpdate);

function NewCommentsEmptyCheck (comment) {
  const { data } = (comment.contents && comment.contents.originalContents) || {}
  if (!data) {
    const EmptyCommentError = createError('comments.comment_empty_error', {message: 'You cannot submit an empty comment'});
    throw new EmptyCommentError({data: {break: true, value: comment}});
  }
  return comment;
}
addCallback("comments.new.validate", NewCommentsEmptyCheck);

export async function CommentsDeleteSendPMAsync (newComment) {
  if (newComment.deleted && newComment.contents && newComment.contents.html) {
    const originalPost = await Posts.findOne(newComment.postId);
    const moderatingUser = await Users.findOne(newComment.deletedByUserId);
    const lwAccount = await getLessWrongAccount();

    const conversationData = {
      participantIds: [newComment.userId, lwAccount._id],
      title: `Comment deleted on ${originalPost.title}`
    }
    const conversation = await newMutation({
      collection: Conversations,
      document: conversationData,
      currentUser: lwAccount,
      validate: false
    });

    let firstMessageContents =
        `One of your comments on "${originalPost.title}" has been removed by ${(moderatingUser && moderatingUser.displayName) || "the Akismet spam integration"}. We've sent you another PM with the content. If this deletion seems wrong to you, please send us a message on Intercom, we will not see replies to this conversation.`
    if (newComment.deletedReason) {
      firstMessageContents += ` They gave the following reason: "${newComment.deletedReason}".`;
    }

    const firstMessageData = {
      userId: lwAccount._id,
      contents: {
        originalContents: {
          type: "html",
          data: firstMessageContents
        }
      },
      conversationId: conversation.data._id
    }

    const secondMessageData = {
      userId: lwAccount._id,
      contents: newComment.contents,
      conversationId: conversation.data._id
    }

    newMutation({
      collection: Messages,
      document: firstMessageData,
      currentUser: lwAccount,
      validate: false
    })

    newMutation({
      collection: Messages,
      document: secondMessageData,
      currentUser: lwAccount,
      validate: false
    })

    // eslint-disable-next-line no-console
    console.log("Sent moderation messages for comment", newComment)
  }
}
addCallback("comments.moderate.async", CommentsDeleteSendPMAsync);

/**
 * @summary Make users upvote their own new comments
 */
 // LESSWRONG – bigUpvote
async function LWCommentsNewUpvoteOwnComment(comment) {
  var commentAuthor = Users.findOne(comment.userId);
  const votedComment = await performVoteServer({ document: comment, voteType: 'smallUpvote', collection: Comments, user: commentAuthor })
  return {...comment, ...votedComment};
}
addCallback('comments.new.after', LWCommentsNewUpvoteOwnComment);

function NewCommentNeedsReview (comment) {
  const user = Users.findOne({_id:comment.userId})
  const karma = user.karma || 0
  if (karma < 100) {
    Comments.update({_id:comment._id}, {$set: {needsReview: true}});
  }
}
addCallback("comments.new.async", NewCommentNeedsReview);

addEditableCallbacks({collection: Comments, options: makeEditableOptions})

async function validateDeleteOperations (modifier, comment, currentUser) {
  if (modifier.$set) {
    const { deleted, deletedPublic, deletedReason } = modifier.$set
    if (deleted || deletedPublic || deletedReason) {
      if (deletedPublic && !deleted) {
        throw new Error("You cannot publicly delete a comment without also deleting it")
      }

      if (deletedPublic && !deletedReason) {
        throw new Error("Publicly deleted comments need to have a deletion reason");
      }

      if (
        (comment.deleted || comment.deletedPublic) &&
        (deletedPublic || deletedReason) &&
        !Users.canDo('comments.remove.all') &&
        comment.deletedByUserId !== currentUser._id) {
          throw new Error("You cannot edit the deleted status of a comment that's been deleted by someone else")
      }

      if (deletedReason && !deleted && !deletedPublic) {
        throw new Error("You cannot set a deleted reason without deleting a comment")
      }

      const childrenComments = await Comments.find({parentCommentId: comment._id}).fetch()
      const filteredChildrenComments = _.filter(childrenComments, (c) => !(c && c.deleted))
      if (
        filteredChildrenComments &&
        (filteredChildrenComments.length > 0) &&
        (deletedPublic || deleted) &&
        !Users.canDo('comment.remove.all')
      ) {
        throw new Error("You cannot delete a comment that has children")
      }
    }
  }
  return modifier
}
addCallback("comments.edit.sync", validateDeleteOperations)

async function moveToAnswers (modifier, comment) {
  if (modifier.$set) {
    if (modifier.$set.answer === true) {
      await Comments.update({topLevelCommentId: comment._id}, {$set:{parentAnswerId:comment._id}}, { multi: true })
    } else if (modifier.$set.answer === false) {
      await Comments.update({topLevelCommentId: comment._id}, {$unset:{parentAnswerId:true}}, { multi: true })
    }
  }
  return modifier
}
addCallback("comments.edit.sync", moveToAnswers)

function HandleReplyToAnswer (comment, properties)
{
  if (comment.parentCommentId) {
    let parentComment = Comments.findOne(comment.parentCommentId)
    if (parentComment) {
      let modifiedComment = {...comment};
      
      if (parentComment.answer) {
        modifiedComment.parentAnswerId = parentComment._id;
      }
      if (parentComment.parentAnswerId) {
        modifiedComment.parentAnswerId = parentComment.parentAnswerId;
      }
      if (parentComment.topLevelCommentId) {
        modifiedComment.topLevelCommentId = parentComment.topLevelCommentId;
      }
      
      return modifiedComment;
    }
  }
}
addCallback('comment.create.before', HandleReplyToAnswer);
