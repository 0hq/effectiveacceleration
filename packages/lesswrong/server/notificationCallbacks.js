import Notifications from '../lib/collections/notifications/collection.js';
import Messages from '../lib/collections/messages/collection.js';
import Conversations from '../lib/collections/conversations/collection.js';
import Subscriptions from '../lib/collections/subscriptions/collection.js';
import { subscriptionTypes } from '../lib/collections/subscriptions/schema';
import Localgroups from '../lib/collections/localgroups/collection.js';
import Users from 'meteor/vulcan:users';
import { Posts } from '../lib/collections/posts';
import { Comments } from '../lib/collections/comments'
import { renderAndSendEmail, reasonUserCantReceiveEmails } from './emails/renderEmail.js';
import './emailComponents/EmailWrapper.jsx';
import './emailComponents/NewPostEmail.jsx';
import './emailComponents/PrivateMessagesEmail.jsx';
import { EventDebouncer } from './debouncer.js';
import { UnsubscribeAllToken } from './emails/emailTokens.js';

import { addCallback, newMutation } from 'meteor/vulcan:core';

import { Components } from 'meteor/vulcan:core';
import React from 'react';
import keyBy from 'lodash/keyBy';

// Return a list of users subscribed to a given document. This is the union of
// users who have subscribed to it explicitly, and users who were subscribed to
// it by default and didn't suppress the subscription.
//
// documentId: The document to look for subscriptions to.
// collectionName: The collection the document to look for subscriptions to is in.
// type: The type of subscription to check for.
// potentiallyDefaultSubscribedUserIds: (Optional) An array of user IDs for
//   users who are potentially subscribed to this document by default, eg
//   because they wrote the post being replied to or are an organizer of the
//   group posted in.
// userIsDefaultSubscribed: (Optional. User=>bool) If
//   potentiallyDefaultSubscribedUserIds is given, takes a user and returns
//   whether they would be default-subscribed to this document.
async function getSubscribedUsers({
  documentId, collectionName, type,
  potentiallyDefaultSubscribedUserIds=null, userIsDefaultSubscribed=null
}) {
  const subscriptions = await Subscriptions.find({documentId, type, collectionName, deleted: false, state: 'subscribed'}).fetch()
  const explicitlySubscribedUserIds = _.pluck(subscriptions, 'userId')
  
  const explicitlySubscribedUsers = await Users.find({_id: {$in: explicitlySubscribedUserIds}}).fetch()
  const explicitlySubscribedUsersDict = keyBy(explicitlySubscribedUsers, u=>u._id);
  
  // Handle implicitly subscribed users
  if (potentiallyDefaultSubscribedUserIds && potentiallyDefaultSubscribedUserIds.length>0) {
    // Filter explicitly-subscribed users out of the potentially-implicitly-subscribed
    // users list, since their subscription status is already known
    potentiallyDefaultSubscribedUserIds = _.filter(potentiallyDefaultSubscribedUserIds, id=>!(id in explicitlySubscribedUsersDict));
    
    // Fetch and filter potentially-subscribed users
    const potentiallyDefaultSubscribedUsers = await Users.find({
      _id: {$in: potentiallyDefaultSubscribedUserIds}
    }).fetch();
    const defaultSubscribedUsers = _.filter(potentiallyDefaultSubscribedUsers, userIsDefaultSubscribed);
    
    // Check for suppression in the subscriptions table
    const suppressions = await Subscriptions.find({documentId, type, collectionName, deleted: false, state: "suppressed"}).fetch();
    const suppressionsByUserId = keyBy(suppressions, s=>s.userId);
    
    return _.union(explicitlySubscribedUsers, _.filter(defaultSubscribedUsers, u=>!(u._id in suppressionsByUserId)));
  } else {
    return explicitlySubscribedUsers;
  }
}

const createNotifications = (userIds, notificationType, documentType, documentId) => {
  userIds.forEach(userId => {
    let user = Users.findOne({ _id:userId });

    let notificationData = {
      userId: userId,
      documentId: documentId,
      documentType: documentType,
      message: notificationMessage(notificationType, documentType, documentId),
      type: notificationType,
      link: getLink(documentType, documentId),
    }

    newMutation({
      action: 'notifications.new',
      collection: Notifications,
      document: notificationData,
      currentUser: user,
      validate: false
    });
  });
}

const sendPostByEmail = async (users, postId, reason) => {
  let post = await Posts.findOne(postId);

  for(let user of users) {
    if(!reasonUserCantReceiveEmails(user)) {
      const unsubscribeAllLink = await UnsubscribeAllToken.generateLink(user._id);
      await renderAndSendEmail({
        user,
        subject: post.title,
        bodyComponent: <Components.EmailWrapper
          user={user}
          unsubscribeAllLink={unsubscribeAllLink}
        >
          <Components.NewPostEmail documentId={post._id} reason={reason}/>
        </Components.EmailWrapper>
      });
    } else {
      //eslint-disable-next-line no-console
      console.log(`Skipping user ${user.username} when emailing: ${reasonUserCantReceiveEmails(user)}`);
    }
  }
}

const getLink = (documentType, documentId) => {
  let document = getDocument(documentType, documentId);

  switch(documentType) {
    case "post":
      return Posts.getPageUrl(document);
    case "comment":
      return Comments.getPageUrl(document);
    case "user":
      return Users.getProfileUrl(document);
    case "message":
      return Messages.getLink(document);
    default:
      //eslint-disable-next-line no-console
      console.error("Invalid notification type");
  }
}

const notificationMessage = (notificationType, documentType, documentId) => {
  let document = getDocument(documentType, documentId);
  let group = {}
  if (documentType == "post" && document.groupId) {
    group = Localgroups.findOne(document.groupId);
  }

  switch(notificationType) {
    case "newPost":
      return Posts.getAuthorName(document) + ' has created a new post: ' + document.title;
    case "newPendingPost":
      return Posts.getAuthorName(document) + ' has a new post pending approval ' + document.title;
    case "postApproved":
      return 'Your post "' + document.title + '" has been approved';
    case "newEvent":
        return Posts.getAuthorName(document) + ' has created a new event in the group "' + group.name + '"';
    case "newGroupPost":
        return Posts.getAuthorName(document) + ' has created a new post in the group "' + group.name + '"';
    case "newComment":
      return Comments.getAuthorName(document) + ' left a new comment on "' + Posts.findOne(document.postId).title + '"';
    case "newReply":
      return Comments.getAuthorName(document) + ' replied to a comment on "' + Posts.findOne(document.postId).title + '"';
    case "newReplyToYou":
        return Comments.getAuthorName(document) + ' replied to your comment on "' + Posts.findOne(document.postId).title + '"';
    case "newUser":
      return document.displayName + ' just signed up!';
    case "newMessage":
      let conversation = Conversations.findOne(document.conversationId);
      return Users.findOne(document.userId).displayName + ' sent you a new message' + (conversation.title ? (' in the conversation ' + conversation.title) : "") + '!';
    default:
      //eslint-disable-next-line no-console
      console.error("Invalid notification type");
  }
}

const getDocument = (documentType, documentId) => {
  switch(documentType) {
    case "post":
      return Posts.findOne(documentId);
    case "comment":
      return Comments.findOne(documentId);
    case "user":
      return Users.findOne(documentId);
    case "message":
      return Messages.findOne(documentId);
    default:
      //eslint-disable-next-line no-console
      console.error("Invalid documentType type");
  }
}


/**
 * @summary Add notification callback when a post is approved
 */
function PostsApprovedNotification(post) {
  createNotifications([post.userId], 'postApproved', 'post', post._id);
}
addCallback("posts.approve.async", PostsApprovedNotification);

async function PostsUndraftNotification(post) {
  //eslint-disable-next-line no-console
  console.info("Post undrafted, creating notifications");

  await postsNewNotifications(post);
}
addCallback("posts.undraft.async", PostsUndraftNotification);

// Add new post notification callback on post submit
async function postsNewNotifications (post) {
  if (!post.draft && post.status === Posts.config.STATUS_APPROVED) {

    // add users who are subscribed to this post's author
    let usersToNotify = await getSubscribedUsers({
      documentId: post.userId,
      collectionName: "Users",
      type: subscriptionTypes.newPosts
    })

    // add users who are subscribed to this post's groups
    if (post.groupId) {
      // Load the group, so we know who the organizers are
      const group = await Localgroups.findOne(post.groupId);
      const organizerIds = group.organizers;
      
      const subscribedUsers = await getSubscribedUsers({
        documentId: post.groupId,
        collectionName: "Localgroups",
        type: subscriptionTypes.newEvents,
        potentiallyDefaultSubscribedUserIds: organizerIds,
        userIsDefaultSubscribed: u => u.autoSubscribeAsOrganizer,
      });
      usersToNotify = _.union(usersToNotify, subscribedUsers)
    }
    
    // remove this post's author
    usersToNotify = _.without(usersToNotify, post.userId);

    if (post.groupId && post.isEvent) {
      createNotifications(usersToNotify, 'newEvent', 'post', post._id);
    } else if (post.groupId && !post.isEvent) {
      createNotifications(usersToNotify, 'newGroupPost', 'post', post._id);
    } else {
      createNotifications(usersToNotify, 'newPost', 'post', post._id);
    }

  }
}
addCallback("posts.new.async", postsNewNotifications);

function findUsersToEmail(filter) {
  let usersMatchingFilter = Users.find(filter, {fields: {_id:1, email:1, emails:1}}).fetch();

  let usersToEmail = usersMatchingFilter.filter(u => {
    if (u.email && u.emails && u.emails.length) {
      let primaryAddress = u.email;

      for(let i=0; i<u.emails.length; i++)
      {
        if(u.emails[i].address === primaryAddress && u.emails[i].verified)
          return true;
      }
      return false;
    } else {
      return false;
    }
  });
  return usersToEmail
}

const curationEmailDelay = new EventDebouncer({
  name: "curationEmail",
  delayMinutes: 20,
  callback: async (postId) => {
    const post = await Posts.findOne(postId);
    
    // Still curated? If it was un-curated during the 20 minute delay, don't
    // send emails.
    if (post.curatedDate) {
      let usersToEmail = findUsersToEmail({'emailSubscribedToCurated': true});
      sendPostByEmail(usersToEmail, postId, "you have the \"Email me new posts in Curated\" option enabled");
    } else {
      //eslint-disable-next-line no-console
      console.log(`Not sending curation notice for ${post.title} because it was un-curated during the delay period.`);
    }
  }
});

function PostsCurateNotification (post, oldPost) {
  if(post.curatedDate && !oldPost.curatedDate) {
    curationEmailDelay.recordEvent({
      key: post._id,
      data: null,
      af: false
    });
  }
}
addCallback("posts.edit.async", PostsCurateNotification);

// add new comment notification callback on comment submit
async function CommentsNewNotifications(comment) {
  // note: dummy content has disableNotifications set to true
  if(Meteor.isServer && !comment.disableNotifications) {
    // keep track of whom we've notified (so that we don't notify the same user twice for one comment,
    // if e.g. they're both the author of the post and the author of a comment being replied to)
    let notifiedUsers = [];

    // 1. Notify users who are subscribed to the parent comment
    if (comment.parentCommentId) {
      const parentComment = Comments.findOne(comment.parentCommentId)
      const subscribedUsers = await getSubscribedUsers({
        documentId: comment.parentCommentId,
        collectionName: "Comments",
        type: subscriptionTypes.newReplies,
        potentiallyDefaultSubscribedUserIds: [parentComment.userId],
        userIsDefaultSubscribed: u => u.auto_subscribe_to_my_comments
      })
      // remove userIds of users that have already been notified
        // and of comment and parentComment author (they could be replying in a thread they're subscribed to)
      let parentCommentSubscribersToNotify = _.difference(subscribedUsers, notifiedUsers, [comment.userId, parentComment.userId])
      createNotifications(parentCommentSubscribersToNotify, 'newReply', 'comment', comment._id);

      // Separately notify author of comment with different notification, if they are subscribed, and are NOT the author of the comment
      if (subscribedUsers.includes(parentComment.userId) && parentComment.userId !== comment.userId) {
        createNotifications([parentComment.userId], 'newReplyToYou', 'comment', comment._id);
        notifiedUsers = [...notifiedUsers, parentComment.userId];
      }
    }
    
    // 2. Notify users who are subscribed to the post (which may or may not include the post's author)
    const post = await Posts.findOne(comment.postId);
    const usersSubscribedToPost = await getSubscribedUsers({
      documentId: comment.postId,
      collectionName: "Posts",
      type: subscriptionTypes.newComments,
      potentiallyDefaultSubscribedUserIds: [post.userId],
      userIsDefaultSubscribed: u => u.auto_subscribe_to_my_posts
    })
    // remove userIds of users that have already been notified
    // and of comment author (they could be replying in a thread they're subscribed to)
    const postSubscribersToNotify = _.difference(usersSubscribedToPost, notifiedUsers, [comment.userId])
    if (postSubscribersToNotify.length > 0) {
      createNotifications(postSubscribersToNotify, 'newComment', 'comment', comment._id)
    }
  }
}
addCallback("comments.new.async", CommentsNewNotifications);

async function sendPrivateMessagesEmail(conversationId, messageIds) {
  const conversation = await Conversations.findOne(conversationId);
  const participants = await Users.find({_id: {$in: conversation.participantIds}}).fetch();
  const participantsById = keyBy(participants, u=>u._id);
  const messages = await Messages.find(
    {_id: {$in: messageIds}},
    { sort: {createdAt:1} })
    .fetch();
  
  for (const recipientUser of participants)
  {
    // TODO: Gradual rollout--only email admins with this. Remove later when
    // this is more tested.
    if (!Users.isAdmin(recipientUser))
      continue;
    
    // If this user is responsible for every message that would be in the
    // email, don't send it to them (you only want emails that contain at
    // least one message that's not your own; your own messages are optional
    // context).
    if (!_.some(messages, message=>message.userId !== recipientUser._id))
      continue;
    
    const otherParticipants = _.filter(participants, u=>u._id != recipientUser._id);
    const subject = `Private message conversation with ${otherParticipants.map(u=>u.displayName).join(', ')}`;
    
    if(!reasonUserCantReceiveEmails(recipientUser)) {
      const unsubscribeAllLink = await UnsubscribeAllToken.generateLink(recipientUser._id);
      await renderAndSendEmail({
        user: recipientUser,
        subject: subject,
        bodyComponent: <Components.EmailWrapper
          user={recipientUser}
          unsubscribeAllLink={unsubscribeAllLink}
        >
          <Components.PrivateMessagesEmail
            conversation={conversation}
            messages={messages}
            participantsById={participantsById}
          />
        </Components.EmailWrapper>
      });
    } else {
      //eslint-disable-next-line no-console
      console.log(`Skipping user ${recipientUser.username} when emailing: ${reasonUserCantReceiveEmails(recipientUser)}`);
    }
  }
}

const privateMessagesDebouncer = new EventDebouncer({
  name: "privateMessage",
  delayMinutes: 15,
  maxDelayMinutes: 30,
  callback: sendPrivateMessagesEmail
});

function messageNewNotification(message) {
  const conversationId = message.conversationId;
  const conversation = Conversations.findOne(conversationId);
  
  // For on-site notifications, notify everyone except the sender of the
  // message. For email notifications, notify everyone including the sender
  // (since if there's a back-and-forth in the grouped notifications, you want
  // to see your own messages.)
  const recipients = conversation.participantIds.filter((id) => (id !== message.userId));

  // Create on-site notification
  createNotifications(recipients, 'newMessage', 'message', message._id);
  
  // Generate debounced email notifications
  privateMessagesDebouncer.recordEvent({
    key: conversationId,
    data: message._id,
    af: conversation.af,
  });
}
addCallback("messages.new.async", messageNewNotification);
