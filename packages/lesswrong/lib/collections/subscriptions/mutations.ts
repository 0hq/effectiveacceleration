import { Subscriptions } from './collection';
import { subscriptionTypes } from './schema'
import { Utils } from '../../vulcan-lib';
import Users from '../users/collection';

export const defaultSubscriptionTypeTable = {
  "Comments": subscriptionTypes.newReplies,
  "Posts": subscriptionTypes.newComments,
  "Users": subscriptionTypes.newPosts,
  "Localgroups": subscriptionTypes.newEvents,
}

/**
 * @summary Perform the un/subscription after verification: update the collection item & the user
 * @param {String} action
 * @param {Collection} collection
 * @param {String} itemId
 * @param {Object} user: current user (xxx: legacy, to replace with this.userId)
 * @returns {Boolean}
 */
export const performSubscriptionAction = async (action, collection, itemId, user) => {
  const collectionName = collection.options.collectionName
  const newSubscription = {
    state: action === "subscribe" ? 'subscribed' : 'supressed',
    documentId: itemId,
    collectionName,
    type: defaultSubscriptionTypeTable[collectionName]
  }
  await Utils.createMutator({
    collection: Subscriptions,
    document: newSubscription,
    validate: true,
    currentUser: user,
    context: {
      currentUser: user,
      Users: Users,
    },
  })
};

