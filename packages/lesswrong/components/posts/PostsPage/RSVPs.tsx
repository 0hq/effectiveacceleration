import Button from '@material-ui/core/Button';
import React, { useCallback, useEffect } from 'react';
import { RSVPType } from '../../../lib/collections/posts/schema';
import { useLocation } from '../../../lib/routeUtil';
import { registerComponent } from '../../../lib/vulcan-lib';
import { commentBodyStyles, postBodyStyles } from '../../../themes/stylePiping';
import { useDialog } from '../../common/withDialog';
import { useCurrentUser } from '../../common/withUser';
import { responseToText } from './RSVPForm';

const styles = (theme: ThemeType): JssStyles => ({
  body: {
    ...postBodyStyles(theme)
  },
  rsvpItem: {
    width: "25%",
    display: "inline-block",
    paddingTop: 4,
    paddingBottom: 4,
    padding: 8,
    verticalAlign: "top",
    [theme.breakpoints.down('sm')]: {
      width: "33.3%"
    },
    [theme.breakpoints.down('xs')]: {
      width: "50%"
    }
  },
  response: {
    ...commentBodyStyles(theme),
    marginTop: -4
  },
  email: {
    ...commentBodyStyles(theme),
    marginTop: -4,
    fontSize: "1rem",
    color: "rgba(0,0,0,0.7)"
  },
  rsvpBlock: {
    marginTop: 10, 
    marginBottom: 10
  }, 
  buttons: {
    [theme.breakpoints.down('xs')]: {
      display: "block"
    },
  },
  button: {

  }, 
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    [theme.breakpoints.down('xs')]: {
      display: "block"
    },
  }
});

const RSVPs = ({post, classes}: {
  post: PostsWithNavigation|PostsWithNavigationAndRevision,
  classes: ClassesType
}) => {
  const { openDialog } = useDialog()
  const { query } = useLocation()
  const currentUser = useCurrentUser()
  const openRSVPForm = useCallback((initialResponse) => {
    openDialog({
      componentName: "RSVPForm",
      componentProps: { post, initialResponse }
    })
  }, [post, openDialog])
  useEffect(() => {
    if(query.rsvpDialog) {
      openRSVPForm("yes")
    }
  })
  return <div className={classes.body}>
    <div className={classes.topRow}>
      <i>The host has requested RSVPs for this event</i>
      <span className={classes.buttons}>
        <Button color="primary" className={classes.button} onClick={() => openRSVPForm("yes")}>Going</Button>
        <Button className={classes.button} onClick={() => openRSVPForm("maybe")}>Maybe</Button>
        <Button className={classes.button} onClick={() => openRSVPForm("no")}>Can't Go</Button>
      </span>
    </div>
    {post.isEvent && post.rsvps?.length > 0 && <div className={classes.rsvpBlock}>
      {post.rsvps.map((rsvp:RSVPType) => <span className={classes.rsvpItem} key={`${rsvp.name}-${rsvp.response}`}>
        <div>{rsvp.name}</div>
        <div className={classes.response}>{responseToText[rsvp.response]}</div>
        {currentUser?._id === post.userId && <div className={classes.email}>{rsvp.email}</div>}
      </span>)}
    </div>}
    
  </div>;
}

const RSVPsComponent = registerComponent('RSVPs', RSVPs, {styles});

declare global {
  interface ComponentTypes {
    RSVPs: typeof RSVPsComponent
  }
}
