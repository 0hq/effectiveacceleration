import { registerComponent } from '../../lib/vulcan-lib';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withLocation, withNavigation } from '../../lib/routeUtil';
import Users from '../../lib/collections/users/collection';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Comments } from '../../lib/collections/comments'
import withUser from '../common/withUser';
import qs from 'qs'
import * as _ from 'underscore';
import { forumTypeSetting } from '../../lib/instanceSettings';

export const viewNames = {
  'postCommentsTop': 'top scoring',
  'postCommentsNew': 'newest',
  'postCommentsOld': 'oldest',
  'postCommentsBest': 'highest karma',
  'postCommentsDeleted': 'deleted',
  'postCommentsSpam': 'spam',
  'postCommentsReported': 'reported',
  'postLWComments': 'top scoring (include LW)',
}

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    display: 'inline'
  },
  link: {
    color: theme.palette.lwTertiary.main,
  }
})

interface ExternalProps {
  post: PostsDetails,
}
interface CommentsViewsProps extends ExternalProps, WithUserProps, WithStylesProps, WithLocationProps, WithNavigationProps {
}
interface CommentsViewsState {
  anchorEl: any,
}

class CommentsViews extends Component<CommentsViewsProps,CommentsViewsState> {
  constructor(props: CommentsViewsProps) {
    super(props);
    this.state = {
      anchorEl: null,
    }
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleViewClick = (view) => {
    const { post } = this.props;
    const { history, location } = this.props; // From withNavigation, withLocation
    const { query } = location;
    const currentQuery = _.isEmpty(query) ? {view: 'postCommentsTop'} : query
    this.setState({ anchorEl: null })
    const newQuery = {...currentQuery, view: view, postId: post ? post._id : undefined}
    history.push({...location.location, search: `?${qs.stringify(newQuery)}`})
  };

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  render() {
    const { currentUser, classes, post } = this.props
    const { query } = this.props.location;
    const { anchorEl } = this.state
    let views = ["postCommentsTop", "postCommentsNew", "postCommentsOld"]
    const adminViews = ["postCommentsDeleted", "postCommentsSpam", "postCommentsReported"]
    const afViews = ["postLWComments"]
    const currentView = query?.view || Comments.getDefaultView(post, currentUser)

    if (Users.canDo(currentUser, "comments.softRemove.all")) {
      views = views.concat(adminViews);
    }

    const af = forumTypeSetting.get() === 'AlignmentForum'
    if (af) {
      views = views.concat(afViews);
    }

    return (
      <div className={classes.root}>
        <a className={classes.link} onClick={this.handleClick}>
          {viewNames[currentView]}
        </a>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {views.map(view => {
            return(
              <MenuItem
                key={view}
                onClick={() => this.handleViewClick(view)}
              >
                {viewNames[view]}
              </MenuItem>)})}
        </Menu>
      </div>
  )}
};

(CommentsViews as any).propTypes = {
  currentUser: PropTypes.object,
  post: PropTypes.object.isRequired,
  defaultView: PropTypes.string,
};

(CommentsViews as any).defaultProps = {
  defaultView: "postCommentsTop"
};

const CommentsViewsComponent = registerComponent<ExternalProps>('CommentsViews', CommentsViews, {
  styles,
  hocs: [withLocation, withNavigation, withUser],
});

declare global {
  interface ComponentTypes {
    CommentsViews: typeof CommentsViewsComponent,
  }
}

