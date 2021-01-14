import { registerComponent, Components } from '../../lib/vulcan-lib';
import React from 'react';
import { userGetCommentCount, userGetPostCount, userGetDisplayName, userGetProfileUrl } from '../../lib/collections/users/helpers';
import { Link } from '../../lib/reactRouterWrapper';
import { truncate } from '../../lib/editor/ellipsize';
import DescriptionIcon from '@material-ui/icons/Description';
import MessageIcon from '@material-ui/icons/Message';
import { BookIcon } from '../icons/bookIcon'
import { useHover } from '../common/withHover'
import classNames from 'classnames';
import { AnalyticsContext } from "../../lib/analyticsEvents";

const styles = (theme: ThemeType): JssStyles => ({
  userName: {
    whiteSpace: "nowrap",
    color: "inherit"
  },
  tooltip: {
    maxWidth: 250,
  },
  joined: {
    fontStyle: "italic",
    marginBottom: theme.spacing.unit
  },
  icon: {
    height: "1rem",
    width: "1rem",
    position: "relative",
    top: 2,
    color: "rgba(255,255,255,.8)"
  },
  bookIcon: {
    filter: "invert(100%)",
  },
  bio: {
    marginTop: theme.spacing.unit
  }
})

// Given a user (which may not be null), render the user name as a link with a
// tooltip. This should not be used directly; use UsersName instead.
const UsersNameDisplay = ({user, nofollow=false, simple=false, classes, tooltipPlacement = "left"}: {
  user: UsersMinimumInfo|null|undefined,
  nofollow?: boolean,
  simple?: boolean,
  classes: ClassesType,
  tooltipPlacement?: "left" | "top" | "right" | "bottom"
}) => {
  const {eventHandlers} = useHover({pageElementContext: "linkPreview",  pageSubElementContext: "userNameDisplay", userId: user?._id})

  if (!user) return <Components.UserNameDeleted/>
  const { FormatDate, LWTooltip } = Components
  const { htmlBio } = user

  const truncatedBio = truncate(htmlBio, 500)
  const postCount = userGetPostCount(user)
  const commentCount = userGetCommentCount(user)
  const sequenceCount = user.sequenceCount; // TODO: Counts LW sequences on Alignment Forum

  const tooltip = <span>
    <div className={classes.joined}>Joined on <FormatDate date={user.createdAt} format="MMM Do YYYY" /></div>
    { !!sequenceCount && <div>
        <BookIcon className={classNames(classes.icon, classes.bookIcon)}/> { sequenceCount } sequence{sequenceCount !== 1 && 's'}
      </div>}
    { !!postCount && <div><DescriptionIcon className={classes.icon} /> { postCount } post{postCount !== 1 && 's'}</div>}
    { !!commentCount && <div><MessageIcon className={classes.icon}  /> { commentCount } comment{commentCount !== 1 && 's'}</div>}
    { truncatedBio && <div className={classes.bio } dangerouslySetInnerHTML={{__html: truncatedBio}}/>}
  </span>

  if (simple) {
    return <span {...eventHandlers} className={classes.userName}>{userGetDisplayName(user)}</span>
  }

  return <span {...eventHandlers}>
    <AnalyticsContext pageElementContext="userNameDisplay" userIdDisplayed={user._id}>
    <LWTooltip title={tooltip} placement={tooltipPlacement}>
      <Link to={userGetProfileUrl(user)} className={classes.userName}
          {...(nofollow ? {rel:"nofollow"} : {})}
        >
        {userGetDisplayName(user)}
      </Link>
    </LWTooltip>
    </AnalyticsContext>
  </span>
}

const UsersNameDisplayComponent = registerComponent(
  'UsersNameDisplay', UsersNameDisplay, {styles}
);

declare global {
  interface ComponentTypes {
    UsersNameDisplay: typeof UsersNameDisplayComponent
  }
}
