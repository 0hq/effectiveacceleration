import React from 'react'
import moment from 'moment';
import { registerComponent } from '../../lib/vulcan-lib';
import { getAddToCalendarLink } from './PortalBarGcalEventItem'

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    ...theme.typography.commentStyle,
    fontSize: '1rem',
    color: 'rgba(0,0,0,0.55)'
  },
  eventTime: {
    fontSize: ".8em",
    opacity: .75
  },
})

const FrontpageGcalEventItem = ({classes, gcalEvent}: {
  classes: ClassesType,
  gcalEvent: any,
}) => {
  return <div className={classes.root}>
    {getAddToCalendarLink(gcalEvent)} <span className={classes.eventTime}>
      {moment(new Date(gcalEvent.start.dateTime)).calendar()}
    </span>
  </div>
}


const FrontpageGcalEventItemComponent = registerComponent('FrontpageGcalEventItem', FrontpageGcalEventItem, {styles});

declare global {
  interface ComponentTypes {
    FrontpageGcalEventItem: typeof FrontpageGcalEventItemComponent
  }
}
