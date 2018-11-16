import { Components, registerComponent } from 'meteor/vulcan:core';
import React from 'react';
import moment from 'moment';
import withTimezone from '../common/withTimezone';

function getDateFormat(dense, isThisYear) {
  if (dense) {
    if (isThisYear) {
      return 'DD MMM'; // 5 Jan
    } else {
      return 'DD MMM YYYY'; // 5 Jan 2020
    }
  } else {
    return 'Do MMMM YYYY'; // 5th January 2020
  }
}

const EventTime = ({post, timezone, dense}) => {
  const start = post.startTime ? moment(post.startTime).tz(timezone) : null;
  const end = post.endTime ? moment(post.endTime).tz(timezone) : null;

  const isThisYear = moment(new Date()).format("YYYY") === moment(start).format("YYYY");

  // Date and time formats
  const timeFormat = 'h:mm A z'; // 11:30 AM PDT
  const dateFormat = getDateFormat(dense, isThisYear);
  const dateAndTimeFormat = dateFormat+', '+timeFormat;
  const calendarFormat = {sameElse : dateAndTimeFormat}

  // Alternate formats omitting the timezone, for the start time in a
  // start-end range.
  const startTimeFormat = 'h:mm A'; // 11:30 AM
  const startCalendarFormat = {sameElse: dateFormat+', '+startTimeFormat};

  // Neither start nor end time specified
  if (!start && !end) {
    return "TBD";
  }
  // Start time specified, end time missing. Use
  // moment.calendar, which has a bunch of its own special
  // cases like "tomorrow".
  // (Or vise versa. Specifying end time without specifying start time makes
  // less sense, but users can enter silly things.)
  else if (!start || !end) {
    const eventTime = start ? start : end;
    return eventTime.calendar({}, calendarFormat)
  }
  // Both start end end time specified
  else {
    // If the start and end time are on the same date, render it like:
    //   January 15, 13:00-15:00 PDT
    // If they're on different dates, render it like:
    //   January 15, 19:00 to January 16 12:00 PDT
    // In both cases we avoid duplicating the timezone.
    if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) {
      return start.format(dateFormat) + ', ' +
        start.format(startTimeFormat) + '-' + end.format(timeFormat);
    } else {
      return (<span>
        {start.calendar({}, startCalendarFormat)}
        to {end.calendar({}, calendarFormat)}
      </span>);
    }
  }
};

registerComponent('EventTime', EventTime, withTimezone);
