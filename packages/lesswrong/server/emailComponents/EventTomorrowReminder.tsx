import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib/components';
import type { RSVPType } from '../../lib/collections/posts/schema';

const styles = (theme: ThemeType): JssStyles => ({
});

const EventTomorrowReminder = ({postId, rsvp}: {
  postId: string,
  rsvp: RSVPType,
}) => {
  return <Components.NewPostEmail
    documentId={postId}
    hideRecommendations={true}
    reason={`you RSVPed ${rsvp.response} to this event`}
  />
}

const EventTomorrowReminderComponent = registerComponent("EventTomorrowReminder", EventTomorrowReminder, {styles});

declare global {
  interface ComponentTypes {
    EventTomorrowReminder: typeof EventTomorrowReminderComponent
  }
}
