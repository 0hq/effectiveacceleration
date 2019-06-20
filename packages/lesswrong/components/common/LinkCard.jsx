import React from 'react';
import { registerComponent } from 'meteor/vulcan:core';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { Link } from '../../lib/reactRouterWrapper.js';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
  root: {
    cursor: "pointer",
    position: "relative",
    
    "& a": {
      position: "relative",
      zIndex: 1,
    },
  },
  background: {
    width: "100%",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 0,
    
    "& a": {
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
    },
  },
});

// A clickable card which can contain clickable links. This exists to work
// around a limitation of HTML, which is that you can't nest <a> tags in <a>
// tags, and making the outer link be a Javascript link breaks the default
// Cmd/Ctrl/Middle-Click to open in new tab interaction. So, following a hack
// described in https://www.sarasoueidan.com/blog/nested-links/, we make the
// card background and card contents siblings rather than nested, then use
// z-index to control which is clickable.
const LinkCard = ({children, to, tooltip, className, classes}) => {
  const card = (
    <div className={classNames(className, classes.root)}>
      <div className={classes.background}>
        <Link to={to}/>
      </div>
      {children}
    </div>
  );
  
  if (tooltip) {
    return <Tooltip title={tooltip} placement="bottom-start">
      {card}
    </Tooltip>;
  } else {
    return card;
  }
}


registerComponent("LinkCard", LinkCard,
  withStyles(styles, {name: "LinkCard"}));
