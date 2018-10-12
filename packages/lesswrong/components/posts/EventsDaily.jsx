import { Components, registerComponent, getSetting, registerSetting } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

registerSetting('forum.numberOfDays', 5, 'Number of days to display in Daily view');

class EventsDaily extends Component {
  render() {
    const numberOfDays = getSetting('forum.numberOfDays', 5);
    const terms = {
      view: 'pastEvents',
      timeField: 'startTime',
      after: moment().utc().subtract(numberOfDays - 1, 'days').format('YYYY-MM-DD'),
      before: moment().utc().add(1, 'days').format('YYYY-MM-DD'),
    };

    return <div className="posts-daily-wrapper">
      <Components.Section title="Past Events by Day">
        <div className="posts-daily-content-wrapper">
          <Components.PostsDailyList title="Past Events by Day"
            terms={terms} days={numberOfDays}/>
        </div>
      </Components.Section>
    </div>
  }
}

EventsDaily.displayName = 'EventsDaily';
registerComponent('EventsDaily', EventsDaily);
