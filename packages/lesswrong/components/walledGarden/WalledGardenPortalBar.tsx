import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { Button, Typography } from "@material-ui/core";
import {commentBodyStyles } from "../../themes/stylePiping";
import { useCurrentUser } from '../common/withUser';
import { CAL_ID } from "./gardenCalendar";
import { gatherTownURL } from "./GatherTownIframeWrapper";

const widgetStyling = {
  marginLeft: 30,
}

const gatherTownRightSideBarWidth = 300

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    ...commentBodyStyles(theme, true),
    padding: 16,
    marginBottom: 0,
    marginTop: 0,
    position: "relative"
  },
  widgetsContainer: {
    display: "flex",
    flexWrap: "wrap"
  },
  portalBarButton: {
    position: "relative",
    left: `calc((100vw - ${gatherTownRightSideBarWidth}px)/2)`,
    "&:hover": {
      opacity: .5,
      background: "none"
    },
  },
  gardenCodeWidget: {
    ...widgetStyling
  },
  eventWidget: {
    width: 400,
    ...widgetStyling
  },
  pomodoroTimerWidget: {
    ...widgetStyling
  },
  codesList: {
    marginLeft: 60
  },
  calendarLinks: {
    fontSize: ".8em",
    marginTop: "3px"
  },
  events: {
    marginRight: 60
  },
  fbEventButton: {
    width: 135
  },
  textButton: {
    marginRight: 16,
    fontSize: "1rem",
    fontStyle: "italic"
  },
  calendars: {
    marginLeft: 60
  },
  link: {
    marginRight: 16,
    fontSize: "1rem",
    fontStyle: "italic",
    '& a': {
      color: theme.palette.grey[500]
    }
  }
})

export const WalledGardenPortalBar = ({iframeRef, classes}:{iframeRef:React.RefObject<HTMLIFrameElement|null>, classes:ClassesType}) => {
  const { GardenCodeWidget, GardenCodesList, WalledGardenEvents, PomodoroWidget } = Components

  const currentUser =  useCurrentUser()

  if (!currentUser) return null
  const refocusOnIframe = () => iframeRef?.current && iframeRef.current.focus()

  return <div className={classes.root}>
    <div className={classes.widgetsContainer}>
      {currentUser.walledGardenInvite && <div className={classes.events}>
        <Typography variant="title">Garden Events</Typography>
        <div className={classes.calendarLinks}>
          <GardenCodeWidget/>
          <div><a href={"https://www.facebook.com/events/create/?group_id=356586692361618"} target="_blank" rel="noopener noreferrer">
            <Button variant="outlined" className={classes.fbEventButton}>Create FB Event</Button>
          </a></div>
        </div>
      </div>}
      {currentUser.walledGardenInvite && <div className={classes.eventWidget} onClick={() => refocusOnIframe()}>
        <WalledGardenEvents frontpage={false}/>
      </div>}
      <div className={classes.codesList}>
        <GardenCodesList />
      </div>
      {currentUser.walledGardenInvite && <div className={classes.calendars}>
        <div className={classes.textButton}>
          <a href={`https://calendar.google.com/calendar/u/0?cid=${CAL_ID}`} target="_blank" rel="noopener noreferrer">
            Google Calendar
          </a>
        </div>
        <div className={classes.textButton}>
          <a href={"https://www.facebook.com/groups/356586692361618/events"} target="_blank" rel="noopener noreferrer">
            Facebook Group
          </a>
        </div>
        <div className={classes.link}>
          <a href={gatherTownURL} rel="noopener noreferrer">
            Backup GatherTown Link
          </a>
        </div>
      </div>}
      <div className={classes.pomodoroTimerWidget} onClick={() => refocusOnIframe()}>
        <PomodoroWidget />
      </div>
    </div>
  </div>
}

const WalledGardenPortalBarComponent = registerComponent('WalledGardenPortalBar', WalledGardenPortalBar, {styles});

declare global {
  interface ComponentTypes {
    WalledGardenPortalBar: typeof WalledGardenPortalBarComponent
  }
}
