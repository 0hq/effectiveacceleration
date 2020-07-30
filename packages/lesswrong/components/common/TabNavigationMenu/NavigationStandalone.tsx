import React from 'react';
import { registerComponent, Components } from '../../../lib/vulcan-lib';
import Slide from '@material-ui/core/Slide'
import { useLocation } from '../../../lib/routeUtil';
import classNames from 'classnames';
import { TAB_NAVIGATION_MENU_WIDTH } from './TabNavigationMenu';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    width: TAB_NAVIGATION_MENU_WIDTH
  },
  sidebar: {
    paddingTop: 15,
    [theme.breakpoints.down('md')]: {
      display: "none"
    },
  },
  footerBar: {
    [theme.breakpoints.up('lg')]: {
      display: "none"
    },
    position: "fixed",
    bottom: 0,
    left: 0,
    backgroundColor: theme.palette.grey[300],
    width: "100%",
    zIndex: theme.zIndexes.footerNav
  },
  "@media print": {
    display: "none"
  },
  background: {
    background: "rgba(255,255,255,.75)"
  }
})

const NavigationStandalone = ({sidebarHidden, classes}) => {
  const { TabNavigationMenu, TabNavigationMenuFooter } = Components
  const { location } = useLocation();

  const background = ["/community"].includes(location.pathname)

  return <div className={classes.root}>
    <div className={classNames(classes.sidebar, {[classes.background]: background})}>
      <Slide
        direction='right'
        in={!sidebarHidden}
        appear={false}
        mountOnEnter
        unmountOnExit
      >
        <TabNavigationMenu />
      </Slide>
    </div>
    <div className={classes.footerBar}>
      <TabNavigationMenuFooter />
    </div>
  </div>
}

const NavigationStandaloneComponent = registerComponent(
  'NavigationStandalone', NavigationStandalone, {styles}
);

declare global {
  interface ComponentTypes {
    NavigationStandalone: typeof NavigationStandaloneComponent
  }
}
