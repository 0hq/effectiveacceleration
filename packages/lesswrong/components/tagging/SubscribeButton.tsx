import React from 'react';
import { Components, registerComponent, getCollectionName } from '../../lib/vulcan-lib';
import { useMessages } from '../common/withMessages';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';
import { useTracking } from "../../lib/analyticsEvents";
import { useSubscribeUserToTag } from '../../lib/filterSettings';
import { subscriptionTypes } from '../../lib/collections/subscriptions/schema';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.up('sm')]: {
      marginTop: 8,
    }
  },
  notifyMeButton: {
    marginLeft: 12,
  },
})

const SubscribeButton = ({
  tag,
  subscribeMessage,
  unsubscribeMessage,
  className,
  classes,
}: {
  tag: TagBasicInfo,
  subscriptionType?: string,
  subscribeMessage?: string,
  unsubscribeMessage?: string,
  className?: string,
  classes: ClassesType,
}) => {
  const { isSubscribed, subscribeUserToTag } = useSubscribeUserToTag(tag)
  const { flash } = useMessages();
  const { captureEvent } = useTracking()
  const { LWTooltip, NotifyMeButton } = Components
  
  const onSubscribe = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      const newMode = isSubscribed ? "Default" : "Subscribed"
      captureEvent('newSubscribeClicked', {tagId: tag._id, newMode})
      subscribeUserToTag(tag, newMode)
      
      flash({messageString: isSubscribed ? "Unsubscribed" : "Subscribed"});
    } catch(error) {
      flash({messageString: error.message});
    }
  }
  
  return <div className={classNames(className, classes.root)}>
    <LWTooltip title={isSubscribed ?
      "Remove homepage boost for posts with this tag" :
      "See more posts with this tag on the homepage"
    }>
      <Button variant="outlined" onClick={onSubscribe}>
        <span className={classes.subscribeText}>{ isSubscribed ? unsubscribeMessage : subscribeMessage}</span>
      </Button>
    </LWTooltip>
    <NotifyMeButton
      document={tag}
      tooltip="Click to toggle notifications for posts with this tag"
      showIcon
      hideLabel
      hideIfNotificationsDisabled={!isSubscribed}
      subscriptionType={subscriptionTypes.newTagPosts}
      className={classes.notifyMeButton}
    />
  </div>
}

const SubscribeButtonComponent = registerComponent('SubscribeButton', SubscribeButton, {styles});

declare global {
  interface ComponentTypes {
    SubscribeButton: typeof SubscribeButtonComponent
  }
}
