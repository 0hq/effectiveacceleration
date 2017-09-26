import { Components, replaceComponent, withCurrentUser} from 'meteor/vulcan:core';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Posts } from "meteor/example-forum";
import moment from 'moment';

import CommentIcon from 'material-ui/svg-icons/editor/mode-comment';
import IconButton from 'material-ui/IconButton';
import Badge from 'material-ui/Badge';
import Paper from 'material-ui/Paper';

const paperStyle = {
  backgroundColor: 'transparent',
}




class PostsItem extends PureComponent {
  //
  // renderCategories() {
  //   return this.props.post.categories && this.props.post.categories.length > 0 ? <Components.PostsCategories post={this.props.post} /> : "";
  // }
  //
  // renderCommenters() {
  //   return this.props.post.commenters && this.props.post.commenters.length > 0 ? <Components.PostsCommenters post={this.props.post}/> : "";
  // }
  //
  renderActions() {
    return (
      <div className="posts-actions">
        <Link to={{pathname:'/editPost', query:{postId: this.props.post._id}}}>
          Edit
        </Link>
      </div>
    )
  }

  renderPostFeeds() {
    const feed = this.props.post.feed
    return (feed && feed.user ? <object> <a href={this.props.post.feedLink} className="post-feed-nickname"> {feed.nickname} </a> </object> : null);
  }


  render() {

    const {post, chapter, inlineCommentCount} = this.props;
    const read = post.lastVisitedAt;
    const newComments = post.lastVisitedAt < post.lastCommentedAt;
    const postLink = chapter ? ("/s/" + chapter.sequenceId + "/p/" + post._id) : Posts.getLink(post)

    let postClass = "posts-item";
    if (post.sticky) postClass += " posts-sticky";

    const commentCountIconStyle = {
      width: '30px',
      height: '30px',
      color: read ? (newComments ? 'rgba(100, 169, 105, 0.9)' : 'rgba(100, 169, 105, 0.5)') : 'rgba(0,0,0,0.1)',
    }

    const commentCountBadgeStyle = {
      top: '13px',
      right: '9px',
      pointerEvents: 'none',
      backgroundColor: 'transparent',
      color: read ? 'white' : 'rgba(0,0,0,0.6)',
      zIndex: 2,
    }

    return (
      <Paper
        className={postClass}
        style={paperStyle}
        zDepth={0}
      >
       <Link to={postLink} className="posts-item-title-link" target={Posts.getLinkTarget(post)}>
         <div className="posts-item-content">
          <div className="posts-item-body">
            <h3 className="posts-item-title">
                {post.title}
            </h3>
            {this.renderPostFeeds()}

            <object><div className="posts-item-meta">
              {post.postedAt ? <div className="posts-item-date"> {moment(new Date(post.postedAt)).fromNow()} </div> : null}
              {post.user ? <div className="posts-item-user"><Components.UsersName user={post.user}/></div> : null}
              <div className="posts-item-vote"> <Components.Vote collection={Posts} document={post} currentUser={this.props.currentUser}/> </div>
              {inlineCommentCount ? <div className="posts-item-comments"> {post.commentCount} comments </div> : null}
              {Posts.options.mutations.edit.check(this.props.currentUser, post) ? this.renderActions() : null}
              {this.props.currentUser && this.props.currentUser.isAdmin ? <div className="posts-item-admin"><Components.PostsStats post={post} /></div> : null}
            </div></object>
            <div className="posts-item-summary">
              {post.url ? ("This is a linkpost for " + post.url) : post.excerpt}
            </div>
          </div>

          <div className="posts-item-comments">
            <object><Link to={Posts.getPageUrl(post) + "#comments"}>
              <Badge
                className="posts-item-comment-count"
                badgeContent={post.commentCount || 0}
                secondary={true}
                badgeStyle={commentCountBadgeStyle}
              >
                <IconButton
                  iconStyle={commentCountIconStyle}
                  tooltip={newComments ? ("last comment " + moment(post.lastCommentedAt).calendar()) : "Comments"}
                  >
                  <CommentIcon />
                </IconButton>
              </Badge>
            </Link></object>
          </div>
        </div>
      </Link>
    </Paper>
    )
  }
}

PostsItem.propTypes = {
  currentUser: PropTypes.object,
  post: PropTypes.object.isRequired,
  terms: PropTypes.object,
};

replaceComponent('PostsItem', PostsItem, withCurrentUser);
