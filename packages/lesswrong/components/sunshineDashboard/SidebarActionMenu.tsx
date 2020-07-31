import { registerComponent } from '../../lib/vulcan-lib';
import React from 'react';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    position: "absolute",
    top:0,
    right:0,
    height: "100%",
    display:"flex",
    alignItems: "center",
    backgroundColor: theme.palette.grey[50],
    paddingLeft: theme.spacing.unit*2
  },
})

const SidebarActionMenu = ({children, classes}) => {
  return <div className={classes.root}>
    {children}
  </div>
};

const SidebarActionMenuComponent = registerComponent('SidebarActionMenu', SidebarActionMenu, {styles});

declare global {
  interface ComponentTypes {
    SidebarActionMenu: typeof SidebarActionMenuComponent
  }
}

