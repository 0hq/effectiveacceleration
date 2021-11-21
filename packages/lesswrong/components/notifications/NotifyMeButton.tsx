import React from 'react';
import { Components, registerComponent, getCollectionName } from '../../lib/vulcan-lib';
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
import MenuItem from '@material-ui/core/MenuItem';
import * as _ from 'underscore';

// Note: We're changing 'subscribe' to refer to the frontpage bump of tags, this
// component still talks about 'subscriptions', but we're moving to calling them
// 'notifications enabled'

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    display: "flex",
    alignItems: "center"
  },
  hideOnMobile: {
    [theme.breakpoints.down('sm')]: { //optimized for tag page
      display: "none"
    }
  },
  hide: {
    display: "none"
  },
})

const NotifyMeButton = ({
  document,
  subscriptionType: overrideSubscriptionType,
  subscribeMessage, unsubscribeMessage,
  tooltip,
  asMenuItem = false,
  className="",
  classes,
  showIcon,
  hideLabel = false,
  hideLabelOnMobile = false,
  hideIfNotificationsDisabled = false,
}: {
  document: any,
  subscriptionType?: string,
  subscribeMessage?: string,
  tooltip?: string,
  asMenuItem?: boolean,
  unsubscribeMessage?: string,
  className?: string,
  classes: ClassesType,
  showIcon?: boolean,
  hideLabel?: boolean,
  hideLabelOnMobile?: boolean
  hideIfNotificationsDisabled?: boolean,
}) => {
  const currentUser = useCurrentUser();
  const { flash } = useMessages();
  const { create: createSubscription } = useCreate({
    collection: Subscriptions,
    fragmentName: 'SubscriptionState',
  });
  console.log('--- NotifyMeButton()')
  
  const collectionName = getCollectionName(document.__typename);
  const documentType = collectionName.toLowerCase();
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
    
    collectionName: "Subscriptions",
    fragmentName: 'SubscriptionState',
    enableTotal: false,
  });
  
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
      await createSubscription({data: newSubscription})

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
  if (hideIfNotificationsDisabled && !isSubscribed()) {
    return null;
  }
  
  const icon = showIcon && <ListItemIcon>
    {loading
      ? <Components.Loading/>
      : (isSubscribed()
        ? <NotificationsIcon />
        : <NotificationsNoneIcon />
      )
    }
  </ListItemIcon>
  
  const message = <span
    className={classNames({
      [classes.hideLabelOnMobile]: hideLabelOnMobile,
      [classes.hideLabel]: hideLabel,
    })}
  >
    { isSubscribed() ? unsubscribeMessage : subscribeMessage}
  </span>
  
  const button = <>
    {icon}
    {message}
  </>
  
  const maybeMenuItemButton = asMenuItem ?
    <MenuItem onClick={onSubscribe}>
      <a className={classNames(className, classes.root)}>
        {button}
      </a>
    </MenuItem> :
    <a onClick={onSubscribe} className={classNames(className, classes.root)}>
      {button}
    </a>
  
  const maybeToolipButton = tooltip ? <Components.LWTooltip title={tooltip}>
      {maybeMenuItemButton}
    </Components.LWTooltip> :
    maybeMenuItemButton
    
  return maybeToolipButton
}

const SubscribeToComponent = registerComponent('NotifyMeButton', NotifyMeButton, {styles});

declare global {
  interface ComponentTypes {
    NotifyMeButton: typeof SubscribeToComponent
  }
}
