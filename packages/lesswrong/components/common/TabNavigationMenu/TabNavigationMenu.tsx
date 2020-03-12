import { registerComponent, Components, getSetting } from '../../../lib/vulcan-lib';
import React from 'react';
import { useCurrentUser } from '../withUser';
import { iconWidth } from './TabNavigationItem'

// -- See here for all the tab content --
import menuTabs from './menuTabs'
import { AnalyticsContext } from "../../../lib/analyticsEvents";

export const TAB_NAVIGATION_MENU_WIDTH = 250

const styles = (theme) => {
  return {
    root: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
      maxWidth: TAB_NAVIGATION_MENU_WIDTH,
    },
    divider: {
      width: 50,
      marginLeft: (theme.spacing.unit*2) + (iconWidth + (theme.spacing.unit*2)) - 2,
      marginTop: theme.spacing.unit*1.5,
      marginBottom: theme.spacing.unit*2.5,
      borderBottom: "solid 1px rgba(0,0,0,.2)",
    },
  }
}

const TabNavigationMenu = ({onClickSection, classes}: {
  onClickSection?: any,
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const { TabNavigationItem } = Components
  const customComponentProps = {currentUser}

  return (
      <AnalyticsContext pageSectionContext="navigationMenu">
        <div className={classes.root}>
          {menuTabs[getSetting<string>('forumType')].map(tab => {
            if (tab.divider) {
              return <div key={tab.id} className={classes.divider} />
            }
            if (tab.customComponent) {
              return <tab.customComponent
                key={tab.id}
                onClick={onClickSection}
                {...customComponentProps}
              />
            }

            return <TabNavigationItem
              key={tab.id}
              tab={tab}
              onClick={onClickSection}
            />
          })}
        </div>
    </AnalyticsContext>  )
};

const TabNavigationMenuComponent = registerComponent(
  'TabNavigationMenu', TabNavigationMenu, {styles}
);

declare global {
  interface ComponentTypes {
    TabNavigationMenu: typeof TabNavigationMenuComponent
  }
}
