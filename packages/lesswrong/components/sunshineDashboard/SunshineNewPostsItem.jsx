import { Components, registerComponent, withEdit, withCurrentUser } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import { Posts } from 'meteor/example-forum';
import Users from 'meteor/vulcan:users';
import { Link } from 'react-router'
import FontIcon from 'material-ui/FontIcon';

class SunshineNewPostsItem extends Component {

  handleReview = () => {
    const { currentUser, post, editMutation } = this.props
    editMutation({
      documentId: post._id,
      set: {reviewedByUserId: currentUser._id},
      unset: {}
    })
  }

  handleFrontpage = () => {
    const { currentUser, post, editMutation } = this.props
    editMutation({
      documentId: post._id,
      set: {
        frontpageDate: new Date(),
        reviewedByUserId: currentUser._id
      },
      unset: {}
    })
  }

  handleDelete = () => {
    if (confirm("Are you sure you want to move this post to the author's draft?")) {
      this.props.editMutation({
        documentId: this.props.post._id,
        set: {
          draft: true,
        },
        unset: {}
      })
    }
  }

  render () {
    if (this.props.post) {
      const post = this.props.post
      return (
        <div className="sunshine-sidebar-item new-post">
          <Link to={Posts.getPageUrl(post)}
            className="sunshine-sidebar-posts-title">
              {post.title}
          </Link>
          <div className="sunshine-sidebar-content-hoverover">
            <Link to={Posts.getPageUrl(post)}>
              <h4>{ post.title }</h4>
            </Link>
            { post.url && <p className="sunshine-post-highlight-linkpost">
              This is a linkpost for <Link to={Posts.getLink(post)} target={Posts.getLinkTarget(post)}>{post.url}</Link>
            </p>}
            <div dangerouslySetInnerHTML={{__html:post.htmlHighlight}} />
          </div>
          <div className="sunshine-sidebar-item-meta">
            <span className="karma">
              { post.baseScore }
            </span>
            <Link
              className="sunshine-sidebar-posts-author"
              to={Users.getProfileUrl(post.user)}>
                {post.user.displayName}
            </Link>
          </div>
          <div className="sunshine-sidebar-posts-actions new-post">
            <Link
              className="sunshine-sidebar-posts-action clear"
              target="_blank"
              title="Move to Drafts"
              to={Users.getProfileUrl(post.user)}
              onClick={this.handleDelete}>
                <FontIcon
                  style={{fontSize: "18px", color:"rgba(0,0,0,.25)"}}
                  className="material-icons">
                    clear
                </FontIcon>
                <div className="sunshine-sidebar-posts-item-delete-overlay">

                </div>
            </Link>
            <span
              className="sunshine-sidebar-posts-action frontpage"
              title="Move to Frontpage"
              onClick={this.handleFrontpage}>
              <FontIcon
                style={{fontSize: "24px", color:"rgba(0,0,0,.25)"}}
                className="material-icons">
                  thumb_up
              </FontIcon>
            </span>
            <span
              className="sunshine-sidebar-posts-action review"
              title="Leave on Personal Blog"
              onClick={this.handleReview}>
              <FontIcon
                style={{fontSize: "18px", color:"rgba(0,0,0,.25)"}}
                className="material-icons">
                  done
              </FontIcon>
            </span>
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}

const withEditOptions = {
  collection: Posts,
  fragmentName: 'PostsList',
}
registerComponent('SunshineNewPostsItem', SunshineNewPostsItem, [withEdit, withEditOptions], withCurrentUser);
