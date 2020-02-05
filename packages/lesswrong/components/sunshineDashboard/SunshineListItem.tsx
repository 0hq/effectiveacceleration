import { registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import classNames from 'classnames';

const styles = theme => ({
  root: {
    position:"relative",
    borderTop: "solid 1px rgba(0,0,0,.1)",
    paddingTop: theme.spacing.unit,
    paddingLeft: theme.spacing.unit*2,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  content: {
    ...theme.typography.postStyle,
    overflow: "hidden",
    lineHeight: "1.2rem"
  },
  hover: {
    backgroundColor: theme.palette.grey[50]
  }
})

const SunshineListItem = ({children, classes, hover=false}: {
  children: React.ReactNode,
  classes: ClassesType,
  hover?: boolean,
}) => {
  return <div className={classNames(classes.root, {[classes.hover]:hover})}>
    <div className={classes.content}>
      { children }
    </div>
  </div>
};

const SunshineListItemComponent = registerComponent('SunshineListItem', SunshineListItem, {styles});

declare global {
  interface ComponentTypes {
    SunshineListItem: typeof SunshineListItemComponent
  }
}

