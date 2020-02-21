import React from 'react';
import { registerComponent } from '../../../lib/vulcan-lib';
import classNames from 'classnames'
import { iconWidth } from './TabNavigationItem'
import { TAB_NAVIGATION_MENU_WIDTH } from './TabNavigationMenu';

const styles = (theme) => ({
  root: {
    ...theme.typography.body2,
    display: "block",
    paddingBottom: theme.spacing.unit,
    // padding reflects how large an icon+padding is
    paddingLeft: (theme.spacing.unit*2) + (iconWidth + (theme.spacing.unit*2)),
    paddingRight: theme.spacing.unit*2,
    color: theme.palette.grey[600],
    width: 
      TAB_NAVIGATION_MENU_WIDTH - // base width
      ((theme.spacing.unit*2) + (iconWidth + (theme.spacing.unit*2))) - // paddingLeft
      ( theme.spacing.unit*2), //paddingRight
    fontSize: "1rem",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    '&:hover': {
      opacity: .6
    }
  }
})

const TabNavigationSubItem = ({children, classes, className}: {
  children?: React.ReactNode,
  classes: ClassesType,
  className?: string,
}) => {
  return <div className={classNames(classes.root, className)}>
    {children}
  </div>
}

const TabNavigationSubItemComponent = registerComponent('TabNavigationSubItem', TabNavigationSubItem, {styles});

declare global {
  interface ComponentTypes {
    TabNavigationSubItem: typeof TabNavigationSubItemComponent
  }
}
