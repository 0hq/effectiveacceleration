import React from 'react';
import { Components, registerComponent, Utils } from '../../lib/vulcan-lib';
import { useCreate } from '../../lib/crud/withCreate';
import { useMulti } from '../../lib/crud/withMulti';
import { useMessages } from '../common/withMessages';
import { Subscriptions } from '../../lib/collections/subscriptions/collection'
import { defaultSubscriptionTypeTable } from '../../lib/collections/subscriptions/mutations'
import { userIsDefaultSubscribed } from '../../lib/subscriptionUtil';
import { useCurrentUser } from '../common/withUser';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import classNames from 'classnames';
import { useTracking } from "../../lib/analyticsEvents";
import * as _ from 'underscore';

const styles = theme => ({
  root: {
    display: "flex",
    alignItems: "center"
  }
})

const SubscribeTo = ({
  document,
  subscriptionType: overrideSubscriptionType,
  subscribeMessage, unsubscribeMessage,
  className="",
  classes,
  showIcon
}: {
  document: any,
  subscriptionType?: string,
  subscribeMessage: string,
  unsubscribeMessage: string,
  className?: string,
  classes: ClassesType,
  showIcon?: boolean,
}) => {
  const currentUser = useCurrentUser();
  const { flash } = useMessages();
  const { create: createSubscription } = useCreate({
    collection: Subscriptions,
    fragmentName: 'SubscriptionState',
  });
  
  const documentType = Utils.getCollectionNameFromTypename(document.__typename);
  const collectionName = Utils.capitalize(documentType);
  const subscriptionType = overrideSubscriptionType || defaultSubscriptionTypeTable[collectionName];

  const { captureEvent } = useTracking({eventType: "subscribeClicked", eventProps: {documentId: document._id, documentType: documentType}})
  
  // Get existing subscription, if there is one
  const { results, loading } = useMulti({
    terms: {
      view: "subscriptionState",
      documentId: document._id,
      userId: currentUser?._id,
      type: subscriptionType,
      collectionName,
      limit: 1
    },
    
    collection: Subscriptions,
    fragmentName: 'SubscriptionState',
    enableTotal: false,
    ssr: true
  });
  
  if (loading) {
    return <Components.Loading/>
  }
  
  const isSubscribed = () => {
    // Get the last element of the results array, which will be the most recent subscription
    if (results && results.length > 0) {
      // Get the newest subscription entry (Mingo doesn't enforce the limit:1)
      const currentSubscription = _.max(results, result=>new Date(result.createdAt).getTime());
      
      if (currentSubscription.state === "subscribed")
        return true;
      else if (currentSubscription.state === "suppressed")
        return false;
    }
    return userIsDefaultSubscribed({
      user: currentUser,
      subscriptionType, collectionName, document
    });
  }
  const onSubscribe = async (e) => {
    try {
      e.preventDefault();
      const subscriptionState = isSubscribed() ? 'suppressed' : 'subscribed'
      captureEvent("subscribeClicked", {state: subscriptionState})
      
      const newSubscription = {
        state: subscriptionState,
        documentId: document._id,
        collectionName,
        type: subscriptionType,
      }
      createSubscription({data: newSubscription})

      // success message will be for example posts.subscribed
      flash({messageString: `Successfully ${isSubscribed() ? "unsubscribed" : "subscribed"}`});
    } catch(error) {
      flash({messageString: error.message});
    }
  }

  // can't subscribe to yourself
  if (!currentUser || (collectionName === 'Users' && document._id === currentUser._id)) {
    return null;
  }

  return <a className={classNames(className, classes.root)} onClick={onSubscribe}>
    {showIcon && <ListItemIcon>{isSubscribed() ? <NotificationsIcon /> : <NotificationsNoneIcon /> }</ListItemIcon>}
    { isSubscribed() ? unsubscribeMessage : subscribeMessage}
  </a>
}

const SubscribeToComponent = registerComponent('SubscribeTo', SubscribeTo, {styles});

declare global {
  interface ComponentTypes {
    SubscribeTo: typeof SubscribeToComponent
  }
}



