import Notifications from '../lib/collections/notifications/collection';
import Messages from '../lib/collections/messages/collection';
import { messageGetLink } from '../lib/helpers';
import Subscriptions from '../lib/collections/subscriptions/collection';
import Users from '../lib/collections/users/collection';
import { userGetProfileUrl } from '../lib/collections/users/helpers';
import { Posts } from '../lib/collections/posts';
import { postGetPageUrl } from '../lib/collections/posts/helpers';
import { Comments } from '../lib/collections/comments/collection'
import { commentGetPageUrlFromDB } from '../lib/collections/comments/helpers'
import { DebouncerTiming } from './debouncer';
import { ensureIndex } from '../lib/collectionUtils';
import { getNotificationTypeByName } from '../lib/notificationTypes';
import { notificationDebouncers } from './notificationBatching';
import { defaultNotificationTypeSettings } from '../lib/collections/users/custom_fields';
import * as _ from 'underscore';
import { createMutator } from './vulcan-lib/mutators';
import keyBy from 'lodash/keyBy';
import TagRels from '../lib/collections/tagRels/collection';

/**
 * Return a list of users (as complete user objects) subscribed to a given
 * document. This is the union of users who have subscribed to it explicitly,
 * and users who were subscribed to it by default and didn't suppress the
 * subscription.
 *
 * documentId: The document to look for subscriptions to.
 * collectionName: The collection the document to look for subscriptions to is in.
 * type: The type of subscription to check for.
 * potentiallyDefaultSubscribedUserIds: (Optional) An array of user IDs for
 *   users who are potentially subscribed to this document by default, eg
 *   because they wrote the post being replied to or are an organizer of the
 *   group posted in.
 * userIsDefaultSubscribed: (Optional. User=>bool) If
 *   potentiallyDefaultSubscribedUserIds is given, takes a user and returns
 *   whether they would be default-subscribed to this document.
 */
 export async function getSubscribedUsers({
  documentId, collectionName, type,
  potentiallyDefaultSubscribedUserIds=null, userIsDefaultSubscribed=null
}: {
  documentId: string|null,
  collectionName: CollectionNameString,
  type: string,
  potentiallyDefaultSubscribedUserIds?: null|Array<string>,
  userIsDefaultSubscribed?: null|((u:DbUser)=>boolean),
}) {
  if (!documentId) {
    return [];
  }
  
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
    const potentiallyDefaultSubscribedUsers: Array<DbUser> = await Users.find({
      _id: {$in: potentiallyDefaultSubscribedUserIds}
    }).fetch();
    // @ts-ignore @types/underscore annotated this wrong; the filter is optional, if it's null then everything passes
    const defaultSubscribedUsers: Array<DbUser> = _.filter(potentiallyDefaultSubscribedUsers, userIsDefaultSubscribed);
    
    // Check for suppression in the subscriptions table
    const suppressions = await Subscriptions.find({documentId, type, collectionName, deleted: false, state: "suppressed"}).fetch();
    const suppressionsByUserId = keyBy(suppressions, s=>s.userId);
    const defaultSubscribedUsersNotSuppressed = _.filter(defaultSubscribedUsers, u=>!(u._id in suppressionsByUserId))
    
    return _.union(explicitlySubscribedUsers, defaultSubscribedUsersNotSuppressed);
  } else {
    return explicitlySubscribedUsers;
  }
}

export async function getUsersWhereLocationIsInNotificationRadius(location): Promise<Array<DbUser>> {
  return await Users.aggregate([
    {
      "$geoNear": {
        "near": location, 
        "spherical": true,
        "distanceField": "distance",
        "distanceMultiplier": 0.001,
        "maxDistance": 300000, // 300km is maximum distance we allow to set in the UI
        "key": "nearbyEventsNotificationsMongoLocation"
      }
    },
    {
      "$match": {
        "$expr": {
            "$gt": ["$nearbyEventsNotificationsRadius", "$distance"]
        }
      }
    }
  ]).toArray()
}
ensureIndex(Users, {nearbyEventsNotificationsMongoLocation: "2dsphere"}, {name: "users.nearbyEventsNotifications"})

const getNotificationTiming = (typeSettings): DebouncerTiming => {
  switch (typeSettings.batchingFrequency) {
    case "realtime":
      return { type: "none" };
    case "daily":
      return {
        type: "daily",
        timeOfDayGMT: typeSettings.timeOfDayGMT,
      };
    case "weekly":
      return {
        type: "weekly",
        timeOfDayGMT: typeSettings.timeOfDayGMT,
        dayOfWeekGMT: typeSettings.dayOfWeekGMT,
      };
    default:
      // eslint-disable-next-line no-console
      console.error(`Unrecognized batching frequency: ${typeSettings.batchingFrequency}`);
      return { type: "none" };
  }
}

const notificationMessage = async (notificationType: string, documentType: string|null, documentId: string|null) => {
  return await getNotificationTypeByName(notificationType)
    .getMessage({documentType, documentId});
}

const getDocument = async (documentType: string|null, documentId: string|null) => {
  if (!documentId) return null;
  
  switch(documentType) {
    case "post":
      return await Posts.findOne(documentId);
    case "comment":
      return await Comments.findOne(documentId);
    case "user":
      return await Users.findOne(documentId);
    case "message":
      return await Messages.findOne(documentId);
    case "tagRel": 
      return await TagRels.findOne(documentId)
    default:
      //eslint-disable-next-line no-console
      console.error(`Invalid documentType type: ${documentType}`);
  }
}

const getLink = async (notificationType: string, documentType: string|null, documentId: string|null) => {
  let document = await getDocument(documentType, documentId);

  switch(notificationType) {
    case "emailVerificationRequired":
      return "/resendVerificationEmail";
    default:
      // Fall through to based on document-type
      break;
  }
  
  switch(documentType) {
    case "post":
      return postGetPageUrl(document as DbPost);
    case "comment":
      return await commentGetPageUrlFromDB(document as DbComment);
    case "user":
      return userGetProfileUrl(document as DbUser);
    case "message":
      return messageGetLink(document as DbMessage);
    case "tagRel":
      const post = await Posts.findOne({_id: (document as DbTagRel).postId})
      return postGetPageUrl(post as DbPost);
    default:
      //eslint-disable-next-line no-console
      console.error("Invalid notification type");
  }
}

export const createNotification = async ({userId, notificationType, documentType, documentId, noEmail}:{
  userId: string,
  notificationType: string,
  documentType: string|null,
  documentId: string|null,
  noEmail?: boolean|null
}) => { 
  let user = await Users.findOne({ _id:userId });
  if (!user) throw Error(`Wasn't able to find user to create notification for with id: ${userId}`)
  const userSettingField = getNotificationTypeByName(notificationType).userSettingField;
  const notificationTypeSettings = (userSettingField && user[userSettingField]) ? user[userSettingField] : defaultNotificationTypeSettings;

  let notificationData = {
    userId: userId,
    documentId: documentId||undefined,
    documentType: documentType||undefined,
    message: await notificationMessage(notificationType, documentType, documentId),
    type: notificationType,
    link: await getLink(notificationType, documentType, documentId),
  }

  if (notificationTypeSettings.channel === "onsite" || notificationTypeSettings.channel === "both")
  {
    const createdNotification = await createMutator({
      collection: Notifications,
      document: {
        ...notificationData,
        emailed: false,
        waitingForBatch: notificationTypeSettings.batchingFrequency !== "realtime",
      },
      currentUser: user,
      validate: false
    });
    if (notificationTypeSettings.batchingFrequency !== "realtime") {
      await notificationDebouncers[notificationType]!.recordEvent({
        key: {notificationType, userId},
        data: createdNotification.data._id,
        timing: getNotificationTiming(notificationTypeSettings),
        af: false, //TODO: Handle AF vs non-AF notifications
      });
    }
  }
  if ((notificationTypeSettings.channel === "email" || notificationTypeSettings.channel === "both") && !noEmail) {
    const createdNotification = await createMutator({
      collection: Notifications,
      document: {
        ...notificationData,
        emailed: true,
        waitingForBatch: true,
      },
      currentUser: user,
      validate: false
    });
    if (!notificationDebouncers[notificationType])
      throw new Error("Invalid notification type");
    await notificationDebouncers[notificationType]!.recordEvent({
      key: {notificationType, userId},
      data: createdNotification.data._id,
      timing: getNotificationTiming(notificationTypeSettings),
      af: false, //TODO: Handle AF vs non-AF notifications
    });
  }
}

export const createNotifications = async ({ userIds, notificationType, documentType, documentId, noEmail }:{
  userIds: Array<string>
  notificationType: string,
  documentType: string|null,
  documentId: string|null,
  noEmail?: boolean|null
}) => { 
  return Promise.all(
    userIds.map(async userId => {
      await createNotification({userId, notificationType, documentType, documentId, noEmail});
    })
  );
}
