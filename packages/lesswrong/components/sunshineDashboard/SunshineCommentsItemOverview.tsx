import { Components, registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import { Posts } from '../../lib/collections/posts';
import Users from '../../lib/collections/users/collection';
import { Link } from '../../lib/reactRouterWrapper'
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  comment: {
    fontSize: "1rem",
    lineHeight: "1.5em"
  }
})

const SunshineCommentsItemOverview = ({ comment, classes }) => {
  const { markdown = "" } = comment.contents || {}
  const commentExcerpt = markdown && markdown.substring(0,38);
  return (
    <div>
      <Typography variant="body2">
        <Link to={comment.post && Posts.getPageUrl(comment.post) + "#" + comment._id} className={classes.comment}>
          { comment.deleted ? <span>COMMENT DELETED</span>
            : <span>{ commentExcerpt }</span>
          }
        </Link>
      </Typography>
      <div>
        <Components.SidebarInfo>
          { comment.baseScore }
        </Components.SidebarInfo>
        <Components.SidebarInfo>
          <Link to={Users.getProfileUrl(comment.user)}>
              {comment.user && comment.user.displayName}
          </Link>
        </Components.SidebarInfo>
        <Components.SidebarInfo>
          <Components.CommentsItemDate comment={comment} post={comment.post}/>
        </Components.SidebarInfo>
      </div>
    </div>
  )
}

const SunshineCommentsItemOverviewComponent = registerComponent('SunshineCommentsItemOverview', SunshineCommentsItemOverview, {styles});

declare global {
  interface ComponentTypes {
    SunshineCommentsItemOverview: typeof SunshineCommentsItemOverviewComponent
  }
}

