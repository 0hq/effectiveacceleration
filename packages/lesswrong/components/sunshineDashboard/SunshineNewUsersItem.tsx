/* global confirm */
import { Components, registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import { userGetProfileUrl } from '../../lib/collections/users/helpers';
import { Link } from '../../lib/reactRouterWrapper'

import { useHover } from '../common/withHover'
import withErrorBoundary from '../common/withErrorBoundary'
import red from '@material-ui/core/colors/red';
import DescriptionIcon from '@material-ui/icons/Description'
import FlagIcon from '@material-ui/icons/Flag'

const styles = (theme: ThemeType): JssStyles => ({
  negativeKarma: {
     color: red['A100']
  },
  info: {
    // Wrap between MetaInfo elements. Non-standard CSS which may not work in Firefox.
    wordBreak: "break-word",
    display: "inline-block"
  },
  icon: {
    height: 13,
    color: theme.palette.grey[500],
    position: "relative",
    top: 3
  },
  flagged: {
    background: "rgba(150,0,0,.05)"
  }
})
const SunshineNewUsersItem = ({ user, classes }: {
  user: SunshineUsersList,
  classes: ClassesType,
  updateUser?: any
}) => {
  const { eventHandlers, hover, anchorEl } = useHover();

  const { SunshineListItem, SidebarHoverOver, SunshineNewUsersInfo, MetaInfo, FormatDate } = Components

  return (
    <div {...eventHandlers} className={user.sunshineFlagged ? classes.flagged : null}>
      <SunshineListItem hover={hover}>
        <SidebarHoverOver hover={hover} anchorEl={anchorEl}>
          <SunshineNewUsersInfo user={user} />
        </SidebarHoverOver>
        <div>
          <MetaInfo className={classes.info}>
            { user.karma || 0 }
          </MetaInfo>
          <MetaInfo className={classes.info}>
            <Link className={user.karma < 0 ? classes.negativeKarma : ""} to={userGetProfileUrl(user)}>
                {user.displayName}
            </Link>
          </MetaInfo>
          <MetaInfo className={classes.info}>
            <FormatDate date={user.createdAt}/>
          </MetaInfo>
          {(user.postCount > 0 && !user.reviewedByUserId) && <DescriptionIcon  className={classes.icon}/>}
          {user.sunshineFlagged && <FlagIcon className={classes.icon}/>}
          {!user.reviewedByUserId && <MetaInfo className={classes.info}>
            { user.email || "This user has no email" }
          </MetaInfo>}
        </div>
      </SunshineListItem>
    </div>
  )
}

const SunshineNewUsersItemComponent = registerComponent('SunshineNewUsersItem', SunshineNewUsersItem, {
  styles,
  hocs: [
    withErrorBoundary,
  ]
});

declare global {
  interface ComponentTypes {
    SunshineNewUsersItem: typeof SunshineNewUsersItemComponent
  }
}

