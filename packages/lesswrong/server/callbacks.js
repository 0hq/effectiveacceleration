import Notifications from '../lib/collections/notifications/collection.js';
import Conversations from '../lib/collections/conversations/collection.js';
import Reports from '../lib/collections/reports/collection.js';

import { getCollection } from 'meteor/vulcan:lib';
import { Bans } from '../lib/collections/bans/collection.js';
import Users from 'meteor/vulcan:users';
import { Votes } from '../lib/collections/votes';
import { cancelVoteServer } from './voteServer.js';
import { Posts } from '../lib/collections/posts';
import { Comments } from '../lib/collections/comments'
import { ReadStatuses } from '../lib/collections/readStatus/collection.js';

import {
  addCallback,
  newMutation,
  editMutation,
  removeMutation,
  Utils,
  runCallbacksAsync,
  runQuery
} from 'meteor/vulcan:core';

import { performSubscriptionAction } from '../lib/subscriptions/mutations.js';


function updateConversationActivity (message) {
  // Update latest Activity timestamp on conversation when new message is added
  const user = Users.findOne(message.userId);
  const conversation = Conversations.findOne(message.conversationId);
  editMutation({
    collection: Conversations,
    documentId: conversation._id,
    set: {latestActivity: message.createdAt},
    currentUser: user,
    validate: false,
  });
}
addCallback("messages.new.async", updateConversationActivity);

/**
 * @summary Add default subscribers to the new post.
 */
function PostsNewSubscriptions (post) {
  // Subscribe the post's author to comment notifications for the post
  // (if they have the proper setting turned on)
  const postAuthor = Users.findOne(post.userId);
  if (Users.getSetting(postAuthor, "auto_subscribe_to_my_posts", true)) {
    performSubscriptionAction('subscribe', Posts, post._id, postAuthor);
  }
}
addCallback("posts.new.async", PostsNewSubscriptions);

/**
 * @summary Add default subscribers to the new comment.
 */
function CommentsNewSubscriptions (comment) {
  // Subscribe the comment's author to reply notifications for the comment
  // (if they have the proper setting turned on)
  const commentAuthor = Users.findOne(comment.userId);
  if (Users.getSetting(commentAuthor, "auto_subscribe_to_my_comments", true)) {
    performSubscriptionAction('subscribe', Comments, comment._id, commentAuthor);
  }
}
addCallback("comments.new.async", CommentsNewSubscriptions);

function userEditVoteBannedCallbacksAsync(user, oldUser) {
  if (user.voteBanned && !oldUser.voteBanned) {
    runCallbacksAsync('users.voteBanned.async', user);
  }
  return user;
}
addCallback("users.edit.async", userEditVoteBannedCallbacksAsync);

function userEditNullifyVotesCallbacksAsync(user, oldUser) {
  if (user.nullifyVotes && !oldUser.nullifyVotes) {
    runCallbacksAsync('users.nullifyVotes.async', user);
  }
  return user;
}
addCallback("users.edit.async", userEditNullifyVotesCallbacksAsync);


function userEditDeleteContentCallbacksAsync(user, oldUser) {
  if (user.deleteContent && !oldUser.deleteContent) {
    runCallbacksAsync('users.deleteContent.async', user);
  }
  return user;
}
addCallback("users.edit.async", userEditDeleteContentCallbacksAsync);

function userEditBannedCallbacksAsync(user, oldUser) {
  if (new Date(user.banned) > new Date() && !(new Date(oldUser.banned) > new Date())) {
    runCallbacksAsync('users.ban.async', user);
  }
  return user;
}
addCallback("users.edit.async", userEditBannedCallbacksAsync);

// document, voteType, collection, user, updateDocument

const reverseVote = (vote) => {
  const collection = getCollection(vote.collectionName);
  const document = collection.findOne({_id: vote.documentId});
  const voteType = vote.type;
  const user = Users.findOne({_id: vote.userId});
  if (document && user) {
    // { document, voteType, collection, user, updateDocument }
    cancelVoteServer({document, voteType, collection, user, updateDocument: true})
  } else {
    //eslint-disable-next-line no-console
    console.info("No item or user found corresponding to vote: ", vote, document, user, voteType);
  }
}

const nullifyVotesForUserAndCollection = async (user, collection) => {
  const collectionName = Utils.capitalize(collection._name);
  const votes = await Votes.find({
    collectionName: collectionName,
    userId: user._id,
    cancelled: false,
  }).fetch();
  votes.forEach((vote) => {
    //eslint-disable-next-line no-console
    console.log("reversing vote: ", vote)
    reverseVote(vote);
  });
  //eslint-disable-next-line no-console
  console.info(`Nullified ${votes.length} votes for user ${user.username}`);
}

function nullifyCommentVotes(user) {
  nullifyVotesForUserAndCollection(user, Comments);
  return user;
}
addCallback("users.nullifyVotes.async", nullifyCommentVotes)

function nullifyPostVotes(user) {
  nullifyVotesForUserAndCollection(user, Posts);
  return user;
}
addCallback("users.nullifyVotes.async", nullifyPostVotes)

function userDeleteContent(user) {
  //eslint-disable-next-line no-console
  console.warn("Deleting all content of user: ", user)
  const posts = Posts.find({userId: user._id}).fetch();
  //eslint-disable-next-line no-console
  console.info("Deleting posts: ", posts);
  posts.forEach((post) => {
    editMutation({
      collection: Posts,
      documentId: post._id,
      set: {status: 5},
      unset: {},
      currentUser: user,
      validate: false,
    })

    const notifications = Notifications.find({documentId: post._id}).fetch();
    //eslint-disable-next-line no-console
    console.info(`Deleting notifications for post ${post._id}: `, notifications);
    notifications.forEach((notification) => {
      removeMutation({
        collection: Notifications,
        documentId: notification._id,
        validate: false,
      })
    })

    const reports = Reports.find({postId: post._id}).fetch();
    //eslint-disable-next-line no-console
    console.info(`Deleting reports for post ${post._id}: `, reports);
    reports.forEach((report) => {
      editMutation({
        collection: Reports,
        documentId: report._id,
        set: {closedAt: new Date()},
        unset: {},
        currentUser: user,
        validate: false,
      })
    })
    
    runCallbacksAsync('posts.purge.async', post)
  })

  const comments = Comments.find({userId: user._id}).fetch();
  //eslint-disable-next-line no-console
  console.info("Deleting comments: ", comments);
  comments.forEach((comment) => {
    if (!comment.deleted) {
      editMutation({
        collection: Comments,
        documentId: comment._id,
        set: {deleted: true, deletedDate: new Date()},
        unset: {},
        currentUser: user,
        validate: false,
      })
    }

    const notifications = Notifications.find({documentId: comment._id}).fetch();
    //eslint-disable-next-line no-console
    console.info(`Deleting notifications for comment ${comment._id}: `, notifications);
    notifications.forEach((notification) => {
      removeMutation({
        collection: Notifications,
        documentId: notification._id,
        validate: false,
      })
    })

    const reports = Reports.find({commentId: comment._id}).fetch();
    //eslint-disable-next-line no-console
    console.info(`Deleting reports for comment ${comment._id}: `, reports);
    reports.forEach((report) => {
      editMutation({
        collection: Reports,
        documentId: report._id,
        set: {closedAt: new Date()},
        unset: {},
        currentUser: user,
        validate: false,
      })
    })

    runCallbacksAsync('comments.purge.async', comment)
  })
  //eslint-disable-next-line no-console
  console.info("Deleted n posts and m comments: ", posts.length, comments.length);
}
addCallback("users.deleteContent.async", userDeleteContent);

function userResetLoginTokens(user) {
  Users.update({_id: user._id}, {$set: {"services.resume.loginTokens": []}});
}
addCallback("users.ban.async", userResetLoginTokens);

async function userIPBan(user) {
  const query = `
    query UserIPBan($userId:String) {
      user(input:{selector: {_id: $userId}}) {
        result {
          IPs
        }
      }
    }
  `;
  const IPs = await runQuery(query, {userId: user._id});
  if (IPs) {
    IPs.data.user.result.IPs.forEach(ip => {
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const ban = {
        expirationDate: tomorrow,
        userId: user._id,
        reason: "User account banned",
        comment: "Automatic IP ban",
        ip: ip,
      }
      newMutation({
        action: 'bans.new',
        collection: Bans,
        document: ban,
        currentUser: user,
        validate: false,
      })
    })
  }

}
addCallback("users.ban.async", userIPBan);

function fixUsernameOnExternalLogin(user) {
  if (!user.username) {
    user.username = user.slug;
  }
  return user;
}
addCallback("users.new.sync", fixUsernameOnExternalLogin);

function fixUsernameOnGithubLogin(user) {
  if (user.services && user.services.github) {
    //eslint-disable-next-line no-console
    console.info("Github login detected, setting username and slug manually");
    user.username = user.services.github.username;
    user.slug = user.services.github.username;
  }
  return user;
}
addCallback("users.new.sync", fixUsernameOnGithubLogin);

function updateReadStatus(event) {
  ReadStatuses.update({
    postId: event.documentId,
    userId: event.userId,
  }, {
    $set: {
      isRead: true,
      lastUpdated: event.createdAt
    }
  }, {
    upsert: true
  });
}
addCallback('lwevents.new.sync', updateReadStatus);
