import { Components, registerComponent } from '../../lib/vulcan-lib';
import { withUpdate } from '../../lib/crud/withUpdate';
import React, { Component } from 'react';
import { Comments } from '../../lib/collections/comments';
import { Link } from '../../lib/reactRouterWrapper'
import Typography from '@material-ui/core/Typography';
import { Posts } from '../../lib/collections/posts';
import withHover from '../common/withHover'
import Users from '../../lib/collections/users/collection';
import withUser from '../common/withUser'
import withErrorBoundary from '../common/withErrorBoundary'
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';

interface ExternalProps {
  comment: any,
}
interface SunshineNewCommentsItemProps extends ExternalProps, WithUserProps, WithHoverProps {
  updateComment: any,
}

class SunshineNewCommentsItem extends Component<SunshineNewCommentsItemProps> {
  handleReview = () => {
    const { currentUser, comment, updateComment } = this.props
    updateComment({
      selector: {_id: comment._id},
      data: {reviewedByUserId : currentUser!._id}
    })
  }

  handleDelete = () => {
    const { currentUser, comment, updateComment } = this.props
    if (confirm("Are you sure you want to immediately delete this comment?")) {
      window.open(Users.getProfileUrl(comment.user), '_blank');
      updateComment({
        selector: {_id: comment._id},
        data: {
          deleted: true,
          deletedDate: new Date(),
          deletedByUserId: currentUser!._id,
          deletedReason: "spam"
        }
      })
    }
  }

  render () {
    const { comment, hover, anchorEl } = this.props
    return (
        <Components.SunshineListItem hover={hover}>
          <Components.SidebarHoverOver hover={hover} anchorEl={anchorEl} >
            <Typography variant="body2">
              <Link to={Posts.getPageUrl(comment.post) + "#" + comment._id}>
                Commented on post: <strong>{ comment.post.title }</strong>
              </Link>
              <Components.CommentBody comment={comment}/>
            </Typography>
          </Components.SidebarHoverOver>
          <Components.SunshineCommentsItemOverview comment={comment}/>
            {hover && <Components.SidebarActionMenu>
              <Components.SidebarAction title="Mark as Reviewed" onClick={this.handleReview}>
                <DoneIcon/>
              </Components.SidebarAction>
              <Components.SidebarAction title="Spam (delete immediately)" onClick={this.handleDelete} warningHighlight>
                <ClearIcon/>
              </Components.SidebarAction>
            </Components.SidebarActionMenu>}
        </Components.SunshineListItem>
    )
  }
}

const SunshineNewCommentsItemComponent = registerComponent<ExternalProps>('SunshineNewCommentsItem', SunshineNewCommentsItem, {
  hocs: [
    withUpdate({
      collection: Comments,
      fragmentName: 'CommentsListWithPostMetadata',
    }),
    withUser, withHover(), withErrorBoundary
  ]
});

declare global {
  interface ComponentTypes {
    SunshineNewCommentsItem: typeof SunshineNewCommentsItemComponent
  }
}
