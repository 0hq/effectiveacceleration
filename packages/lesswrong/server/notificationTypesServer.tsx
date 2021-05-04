import React from 'react';
import { Components } from '../lib/vulcan-lib/components';
import { Posts } from '../lib/collections/posts/collection';
import { postGetPageUrl } from '../lib/collections/posts/helpers';
import { Comments } from '../lib/collections/comments/collection';
import { Localgroups } from '../lib/collections/localgroups/collection';
import { Messages } from '../lib/collections/messages/collection';
import { TagRels } from '../lib/collections/tagRels/collection';
import { Conversations } from '../lib/collections/conversations/collection';
import { accessFilterMultiple } from '../lib/utils/schemaUtils';
import keyBy from 'lodash/keyBy';
import Users from '../lib/collections/users/collection';
import { userGetDisplayName } from '../lib/collections/users/helpers';
import * as _ from 'underscore';
import './emailComponents/EmailComment';
import './emailComponents/PrivateMessagesEmail';
import './emailComponents/EventInRadiusEmail';
import { taggedPostMessage } from '../lib/notificationTypes';
import { forumTypeSetting } from '../lib/instanceSettings';

interface ServerNotificationType {
  name: string,
  from?: string,
  canCombineEmails?: boolean,
  loadData?: ({user, notifications}) => Promise<any>,
  emailSubject: ({user, notifications}) => Promise<string>,
  emailBody: ({user, notifications}) => Promise<React.ReactNode>,
}

const notificationTypes: {string?: ServerNotificationType} = {};

export const getNotificationTypeByNameServer = (name: string): ServerNotificationType => {
  if (name in notificationTypes)
    return notificationTypes[name];
  else
    throw new Error(`Invalid notification type: ${name}`);
}

const serverRegisterNotificationType = (notificationTypeClass: ServerNotificationType): ServerNotificationType => {
  const name = notificationTypeClass.name;
  notificationTypes[name] = notificationTypeClass;
  return notificationTypeClass;
}

export const NewPostNotification = serverRegisterNotificationType({
  name: "newPost",
  canCombineEmails: false,
  emailSubject: async ({ user, notifications }) => {
    const postId = notifications[0].documentId;
    const post = await Posts.findOne({_id: postId});
    if (!post) throw Error(`Can't find post to generate subject-line for: ${postId}`)
    return post.title;
  },
  emailBody: async ({ user, notifications }) => {
    const postId = notifications[0].documentId;
    return <Components.NewPostEmail documentId={postId}/>
  },
});

// Vulcan notification that we don't really use
export const PostApprovedNotification = serverRegisterNotificationType({
  name: "postApproved",
  emailSubject: async ({ user, notifications }) => {
    return "LessWrong notification";
  },
  emailBody: async ({ user, notifications }) => null,
});

export const NewEventNotification = serverRegisterNotificationType({
  name: "newEvent",
  canCombineEmails: false,
  emailSubject: async ({ user, notifications }) => {
    const post = await Posts.findOne(notifications[0].documentId);
    if (!post) throw Error(`Can't find post to generate subject-line for: ${notifications}`)
    return post.title;
  },
  emailBody: async ({ user, notifications }) => {
    const postId = notifications[0].documentId;
    return <Components.NewPostEmail documentId={postId}/>
  },
});

export const NewGroupPostNotification = serverRegisterNotificationType({
  name: "newGroupPost",
  canCombineEmails: false,
  emailSubject: async ({ user, notifications }) => {
    const post = await Posts.findOne(notifications[0].documentId);
    const group = await Localgroups.findOne(post?.groupId);
    return `New post in group ${group?.name}`;
  },
  emailBody: async ({ user, notifications }) => {
    const postId = notifications[0].documentId;
    return <Components.NewPostEmail documentId={postId}/>
  },
});

export const NewShortformNotification = serverRegisterNotificationType({
  name: "newShortform",
  canCombineEmails: false,
  emailSubject: async ({user, notifications}) => {
    const comment = await Comments.findOne(notifications[0].documentId)
    const post = comment?.postId && await Posts.findOne(comment.postId)
    // This notification type should never be triggered on tag-comments, so we just throw an error here
    if (!post) throw Error(`Can't find post to generate subject-line for: ${comment}`)
    return 'New comment on "' + post.title + '"';
  },
  emailBody: async ({user, notifications}) => {
    const comment = await Comments.findOne(notifications[0].documentId)
    if (!comment) throw Error(`Can't find comment for comment email notification: ${notifications[0]}`)
    return <Components.EmailCommentBatch comments={[comment]}/>;
  }
})

export const NewTagPostsNotification = serverRegisterNotificationType({
  name: "newTagPosts",
  canCombineEmails: false,
  emailSubject: async ({user, notifications}) => {
    const {documentId, documentType} = notifications[0]
    return await taggedPostMessage({documentId, documentType})
  },
  emailBody: async ({user, notifications}) => {
    const {documentId, documentType} = notifications[0]
    const tagRel = await TagRels.findOne({_id: documentId})
    if (tagRel) {
      return <Components.NewPostEmail documentId={ tagRel.postId}/>
    }
  }
})

export const NewCommentNotification = serverRegisterNotificationType({
  name: "newComment",
  canCombineEmails: true,
  emailSubject: async ({ user, notifications }) => {
    if (notifications.length > 1) {
      return `${notifications.length} comments on posts you subscribed to`;
    } else {
      const comment = await Comments.findOne(notifications[0].documentId);
      if (!comment) throw Error(`Can't find comment for notification: ${notifications[0]}`)
      const author = await Users.findOne(comment.userId);
      if (!author) throw Error(`Can't find author for new comment notification: ${notifications[0]}`)
      return `${author.displayName} commented on a post you subscribed to`;
    }
  },
  emailBody: async ({ user, notifications }) => {
    const commentIds = notifications.map(n => n.documentId);
    const commentsRaw = await Comments.find({_id: {$in: commentIds}}).fetch();
    const comments = await accessFilterMultiple(user, Comments, commentsRaw, null);
    
    return <Components.EmailCommentBatch comments={comments}/>;
  },
});

export const NewReplyNotification = serverRegisterNotificationType({
  name: "newReply",
  canCombineEmails: true,
  emailSubject: async ({ user, notifications }) => {
    if (notifications.length > 1) {
      return `${notifications.length} replies to comments you're subscribed to`;
    } else {
      const comment = await Comments.findOne(notifications[0].documentId);
      if (!comment) throw Error(`Can't find comment for notification: ${notifications[0]}`)
      const author = await Users.findOne(comment.userId);
      if (!author) throw Error(`Can't find author for new comment notification: ${notifications[0]}`)
      return `${userGetDisplayName(author)} replied to a comment you're subscribed to`;
    }
  },
  emailBody: async ({ user, notifications }) => {
    const commentIds = notifications.map(n => n.documentId);
    const commentsRaw = await Comments.find({_id: {$in: commentIds}}).fetch();
    const comments = await accessFilterMultiple(user, Comments, commentsRaw, null);
    
    return <Components.EmailCommentBatch comments={comments}/>;
  },
});

export const NewReplyToYouNotification = serverRegisterNotificationType({
  name: "newReplyToYou",
  canCombineEmails: true,
  emailSubject: async ({ user, notifications }) => {
    if (notifications.length > 1) {
      return `${notifications.length} replies to your comments`;
    } else {
      const comment = await Comments.findOne(notifications[0].documentId);
      if (!comment) throw Error(`Can't find comment for notification: ${notifications[0]}`)
      const author = await Users.findOne(comment.userId);
      if (!author) throw Error(`Can't find author for new comment notification: ${notifications[0]}`)
      return `${userGetDisplayName(author)} replied to your comment`;
    }
  },
  emailBody: async ({ user, notifications }) => {
    const commentIds = notifications.map(n => n.documentId);
    const commentsRaw = await Comments.find({_id: {$in: commentIds}}).fetch();
    const comments = await accessFilterMultiple(user, Comments, commentsRaw, null);
    
    return <Components.EmailCommentBatch comments={comments}/>;
  },
});

// Vulcan notification that we don't really use
export const NewUserNotification = serverRegisterNotificationType({
  name: "newUser",
  emailSubject: async ({ user, notifications }) => {
    return "LessWrong notification";
  },
  emailBody: async ({ user, notifications }) => null,
});

const newMessageEmails = {
  EAForum: 'forum-noreply@effectivealtruism.org'
}
const forumNewMessageEmail = newMessageEmails[forumTypeSetting.get()]

export const NewMessageNotification = serverRegisterNotificationType({
  name: "newMessage",
  from: forumNewMessageEmail, // passing in undefined will lead to default behavior
  loadData: async function({ user, notifications }) {
    // Load messages
    const messageIds = notifications.map(notification => notification.documentId);
    const messagesRaw = await Messages.find({ _id: {$in: messageIds} }).fetch();
    const messages = await accessFilterMultiple(user, Messages, messagesRaw, null);
    
    // Load conversations
    const messagesByConversationId = keyBy(messages, message=>message.conversationId);
    const conversationIds = _.keys(messagesByConversationId);
    const conversationsRaw = await Conversations.find({ _id: {$in: conversationIds} }).fetch();
    const conversations = await accessFilterMultiple(user, Conversations, conversationsRaw, null);
    
    // Load participant users
    const participantIds = _.uniq(_.flatten(conversations.map(conversation => conversation.participantIds), true));
    const participantsRaw = await Users.find({ _id: {$in: participantIds} }).fetch();
    const participants = await accessFilterMultiple(user, Users, participantsRaw, null);
    const participantsById = keyBy(participants, u=>u._id);
    const otherParticipants = _.filter(participants, id=>id!=user._id);
    
    return { conversations, messages, participantsById, otherParticipants };
  },
  emailSubject: async function({ user, notifications }) {
    const { conversations, otherParticipants } = await this.loadData!({ user, notifications });
    
    const otherParticipantNames = otherParticipants.map(u=>userGetDisplayName(u)).join(', ');
    
    return `Private message conversation${conversations.length>1 ? 's' : ''} with ${otherParticipantNames}`;
  },
  emailBody: async function({ user, notifications }) {
    const { conversations, messages, participantsById } = await this.loadData!({ user, notifications });
    
    return <Components.PrivateMessagesEmail
      conversations={conversations}
      messages={messages}
      participantsById={participantsById}
    />
  },
});

// This notification type should never be emailed (but is displayed in the
// on-site UI).
export const EmailVerificationRequiredNotification = serverRegisterNotificationType({
  name: "emailVerificationRequired",
  canCombineEmails: false,
  emailSubject: async ({ user, notifications }) => {
    throw new Error("emailVerificationRequired notification should never be emailed");
  },
  emailBody: async ({ user, notifications }) => {
    throw new Error("emailVerificationRequired notification should never be emailed");
  },
});

export const PostSharedWithUserNotification = serverRegisterNotificationType({
  name: "postSharedWithUser",
  canCombineEmails: false,
  emailSubject: async ({ user, notifications }) => {
    let post = await Posts.findOne(notifications[0].documentId);
    if (!post) throw Error(`Can't find post for notification: ${notifications[0]}`)
    return `You have been shared on the ${post.draft ? "draft" : "post"} ${post.title}`;
  },
  emailBody: async ({ user, notifications }) => {
    const post = await Posts.findOne(notifications[0].documentId);
    if (!post) throw Error(`Can't find post for notification: ${notifications[0]}`)
    const link = postGetPageUrl(post, true);
    return <p>
      You have been shared on the {post.draft ? "draft" : "post"} <a href={link}>{post.title}</a>.
    </p>
  },
});

export const NewEventInRadiusNotification = serverRegisterNotificationType({
  name: "newEventInRadius",
  canCombineEmails: false,
  emailSubject: async ({ user, notifications }) => {
    let post = await Posts.findOne(notifications[0].documentId);
    if (!post) throw Error(`Can't find post for notification: ${notifications[0]}`)
    return `A new event has been created in your area: ${post.title}`;
  },
  emailBody: async ({ user, notifications }) => {
    return <Components.EventInRadiusEmail
      openingSentence="A new event has been created in your area"
      postId={notifications[0].documentId}
    />
  },
});

export const EditedEventInRadiusNotification = serverRegisterNotificationType({
  name: "editedEventInRadius",
  canCombineEmails: false,
  emailSubject: async ({ user, notifications }) => {
    let post = await Posts.findOne(notifications[0].documentId);
    if (!post) throw Error(`Can't find post for notification: ${notifications[0]}`)
    return `An event in your area has been edited: ${post.title}`;
  },
  emailBody: async ({ user, notifications }) => {
    return <Components.EventInRadiusEmail
      openingSentence="An event in your area has been edited"
      postId={notifications[0].documentId}
    />
  },
});
