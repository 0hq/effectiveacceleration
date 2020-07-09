import React from 'react';
import { Notifications } from '../lib/collections/notifications/collection';
import { getNotificationTypes } from '../lib/notificationTypes';
import { getNotificationTypeByNameServer } from './notificationTypesServer';
import { EventDebouncer } from './debouncer';
import toDictionary from '../lib/utils/toDictionary';
import Users from '../lib/collections/users/collection';
import { Posts } from '../lib/collections/posts';
import { Components, addGraphQLQuery, addGraphQLSchema, addGraphQLResolvers } from './vulcan-lib';
import { UnsubscribeAllToken } from './emails/emailTokens';
import { generateEmail, sendEmail, logSentEmail } from './emails/renderEmail';
import Sentry from '@sentry/node';

// string (notification type name) => Debouncer
export const notificationDebouncers = toDictionary(getNotificationTypes(),
  notificationTypeName => notificationTypeName,
  notificationTypeName => {
    return new EventDebouncer({
      name: `notification_${notificationTypeName}`,
      defaultTiming: {
        type: "delayed",
        delayMinutes: 15,
      },
      callback: ({ userId, notificationType }, notificationIds) => {
        void sendNotificationBatch({userId, notificationIds});
      }
    });
  }
);

// Precondition: All notifications in a batch share a notification type
const sendNotificationBatch = async ({ userId, notificationIds }) => {
  if (!notificationIds || !notificationIds.length)
    throw new Error("Missing or invalid argument: notificationIds (must be a nonempty array)");
  
  const user = Users.getUser(userId);
  Notifications.update(
    { _id: {$in: notificationIds} },
    { $set: { waitingForBatch: false } },
    { multi: true }
  );
  const notifications = await Notifications.find(
    { _id: {$in: notificationIds} }
  ).fetch();
  
  if (!notifications.length)
    throw new Error("Failed to find notifications");
  
  const emails: any = await notificationBatchToEmails({
    user, notifications
  });
  
  for (let email of emails) {
    await wrapAndSendEmail(email);
  }
}

const notificationBatchToEmails = async ({ user, notifications }) => {
  const notificationType = notifications[0].type;
  const notificationTypeRenderer = getNotificationTypeByNameServer(notificationType);
  
  if (notificationTypeRenderer.canCombineEmails) {
    return [{
      user,
      subject: await notificationTypeRenderer.emailSubject({ user, notifications }),
      body: await notificationTypeRenderer.emailBody({ user, notifications }),
    }];
  } else {
    return await Promise.all(notifications.map(async notification => ({
      user,
      subject: await notificationTypeRenderer.emailSubject({ user, notifications:[notification] }),
      body: await notificationTypeRenderer.emailBody({ user, notifications:[notification] }),
    })));
  }
}

export const wrapAndRenderEmail = async ({user, subject, body}) => {
  const unsubscribeAllLink = await UnsubscribeAllToken.generateLink(user._id);
  return await generateEmail({
    user,
    subject: subject,
    bodyComponent: <Components.EmailWrapper
      user={user} unsubscribeAllLink={unsubscribeAllLink}
    >
      {body}
    </Components.EmailWrapper>
  });
}

export const wrapAndSendEmail = async ({user, subject, body}) => {
  try {
    const email = await wrapAndRenderEmail({ user, subject, body });
    await sendEmail(email);
    await logSentEmail(email, user);
  } catch(e) {
    Sentry.captureException(e);
  }
}

addGraphQLResolvers({
  Query: {
    async EmailPreview(root, {notificationIds, postId}, context: ResolverContext) {
      const { currentUser } = context;
      if (!Users.isAdmin(currentUser)) {
        throw new Error("This debug feature is only available to admin accounts");
      }
      if (!notificationIds?.length && !postId) {
        return [];
      }
      if (notificationIds?.length && postId) {
        throw new Error("Please only specify notificationIds or postId in the query")
      }
      
      let emails:any[] = []
      if (notificationIds?.length) {
        const notifications = await Notifications.find(
          { _id: {$in: notificationIds} }
        ).fetch();
        emails = await notificationBatchToEmails({
          user: currentUser,
          notifications
        });
      }
      if (postId) {
        const post = Posts.findOne(postId)
        if (post) {
          emails = [{
            user: currentUser,
            subject: post.title,
            body: <Components.NewPostEmail documentId={post._id} reason='you have the "Email me new posts in Curated" option enabled' />
          }]
        }
      }
      const renderedEmails = await Promise.all(emails.map(async email => await wrapAndRenderEmail(email)));
      return renderedEmails;
    }
  }
});
addGraphQLSchema(`
  type EmailPreview {
    to: String
    subject: String
    html: String
    text: String
  }
`);
addGraphQLQuery("EmailPreview(notificationIds: [String], postId: String): [EmailPreview]");
