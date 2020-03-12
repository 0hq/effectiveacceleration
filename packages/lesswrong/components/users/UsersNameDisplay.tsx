import { registerComponent, Components } from '../../lib/vulcan-lib';
import React from 'react';
import Users from '../../lib/collections/users/collection';
import { Link } from '../../lib/reactRouterWrapper';
import { truncate } from '../../lib/editor/ellipsize';
import DescriptionIcon from '@material-ui/icons/Description';
import MessageIcon from '@material-ui/icons/Message';
import { BookIcon } from '../icons/bookIcon'
import withHover from '../common/withHover'
import classNames from 'classnames';
import { AnalyticsContext } from "../../lib/analyticsEvents";

const styles = theme => ({
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

interface ExternalProps {
  user: UsersMinimumInfo,
  nofollow?: boolean,
  simple?: boolean,
}
interface UsersNameDisplayProps extends ExternalProps, WithStylesProps, WithHoverProps {
}

// Given a user (which may not be null), render the user name as a link with a
// tooltip. This should not be used directly; use UsersName instead.
const UsersNameDisplay = ({user, classes, nofollow=false, simple=false, hover, anchorEl, stopHover}: UsersNameDisplayProps) => {

  if (!user) return <Components.UserNameDeleted/>
  const { FormatDate, LWTooltip } = Components
  const { htmlBio } = user

  const truncatedBio = truncate(htmlBio, 500)
  const postCount = Users.getPostCount(user)
  const commentCount = Users.getCommentCount(user)
  const sequenceCount = user.sequenceCount; // TODO: Counts LW sequences on Alignment Forum

  const tooltip = <span>
    <div className={classes.joined}>Joined on <FormatDate date={user.createdAt} format="MMM Do YYYY" /></div>
    { !!sequenceCount && <div>
        <BookIcon className={classNames(classes.icon, classes.bookIcon)}/> { sequenceCount } sequences
      </div>}
    { !!postCount && <div><DescriptionIcon className={classes.icon} /> { postCount } posts</div>}
    { !!commentCount && <div><MessageIcon className={classes.icon}  /> { commentCount } comments</div>}
    { truncatedBio && <div className={classes.bio } dangerouslySetInnerHTML={{__html: truncatedBio}}/>}
  </span>

  if (simple) {
    return <span className={classes.userName}>{Users.getDisplayName(user)}</span>
  }

  return <AnalyticsContext pageElementContext="userNameDisplay" userIdDisplayed={user._id}>
    <LWTooltip title={tooltip} placement="left">
      <Link to={Users.getProfileUrl(user)} className={classes.userName}
          {...(nofollow ? {rel:"nofollow"} : {})}
        >
        {Users.getDisplayName(user)}
      </Link>
    </LWTooltip>
  </AnalyticsContext>
}

const UsersNameDisplayComponent = registerComponent<ExternalProps>(
  'UsersNameDisplay', UsersNameDisplay, {
    styles,
    hocs: [
      withHover({pageElementContext: "linkPreview",  pageSubElementContext: "userNameDisplay"}, ({user})=>({userId: user._id}))
    ]
  }
);

declare global {
  interface ComponentTypes {
    UsersNameDisplay: typeof UsersNameDisplayComponent
  }
}
