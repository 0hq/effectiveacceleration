import React from 'react';
import { registerComponent } from '../../lib/vulcan-lib';

const styles = theme => ({
  emailPreview: {},
  headerName: {},
  headerContent: {},
  emailBodyFrame: {
    width: 800,
    height: 500,
    marginLeft: "auto",
    marginRight: "auto",
  },
  emailTextVersion: {
    width: 800,
    height: 300,
    overflowY: "scroll",
    border: "1px solid black",
    padding: 10,
    whiteSpace: "pre",
  },
});

export const EmailPreview = ({email, classes}: {
  email: any,
  classes: ClassesType,
}) => {
  return <div className={classes.emailPreview}>
    <div className={classes.emailHeader}>
      <span className={classes.headerName}>Subject: </span>
      <span className={classes.headerContent}>{email.subject}</span>
    </div>
    <div className={classes.emailHeader}>
      <span className={classes.headerName}>To: </span>
      <span className={classes.headerContent}>{email.to}</span>
    </div>
    <iframe className={classes.emailBodyFrame} srcDoc={email.html}/>
    <div className={classes.emailTextVersion}>
      {email.text}
    </div>
  </div>;
}

const EmailPreviewComponent = registerComponent('EmailPreview', EmailPreview, {styles});

declare global {
  interface ComponentTypes {
    EmailPreview: typeof EmailPreviewComponent
  }
}

