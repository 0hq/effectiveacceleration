import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'meteor/vulcan:i18n';
import DatePicker from 'material-ui/DatePicker';
import { withRouter } from 'react-router'
import {
  withCurrentUser,
  Components,
  registerComponent,
  getSetting
} from 'meteor/vulcan:core';
import moment from 'moment';
import Users from 'meteor/vulcan:users';
import { Comments } from "meteor/example-forum";

const datePickerTextFieldStyle = {
  display: 'none',
  boxShadow: 'none',
  hr: {
    display: 'none',
  }
}

class CommentsListSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlightDate: this.props.lastEvent && this.props.lastEvent.properties && this.props.lastEvent.properties.createdAt && new Date(this.props.lastEvent.properties.createdAt) || this.props.post && this.props.post.lastVisitedAt && new Date(this.props.post.lastVisitedAt) || new Date(),
    }
  }

  renderHighlightDateSelector = () => <div className="highlight-date-selector">
    Highlighting new comments since <a className="highlight-date-selector-date" onClick={(e) => this.refs.dp.openDialog()}>{moment(this.state.highlightDate).calendar()}</a>
    <DatePicker
      autoOk={true}
      className="highlight-date-selector-dialog"
      value={this.state.highlightDate}
      onChange={(dummy, date) => {
        this.setState({highlightDate: new Date(date)})}
      }
      hintText="Select new highlight date"
      textFieldStyle={datePickerTextFieldStyle}
      ref="dp"
      maxDate={new Date()}
      id="datepicker"
    />
  </div>

  renderCommentCount = () => {
    if (this.props.commentCount < this.props.totalComments) {
      return (
        <span className="posts-page-comments-count">
          Rendering {this.props.commentCount}/{this.props.totalComments} comments, {this.renderCommentSort()}
          {this.props.loadingMoreComments ? <Components.Loading /> : <a onClick={() => this.props.loadMoreComments()}>(show more)</a>}
        </span>
      )
    } else {
      return (
        <span className="posts-page-comments-count">
          { this.props.totalComments } comments, {this.renderCommentSort()}
        </span>
      )
    }
  }

  renderCommentSort = () => <span className="posts-page-comments-sort">sorted by <Components.CommentsViews postId={this.props.postId} /></span>

  renderTitleComponent = () => (
    <div className="posts-page-comments-title-component">
      { this.renderCommentCount() }
      { this.renderHighlightDateSelector() }
    </div>
  )

  render() {
    const {
      currentUser,
      comments,
      postId,
      post,
    } = this.props;

    // TODO: Update "author has blocked you" message to include link to moderation guidelines (both author and LW)

    return (
      <div className="posts-comments-thread">
        { this.props.totalComments ? this.renderTitleComponent() : null }
        <Components.ModerationGuidelinesBox documentId={this.props.post._id} showModeratorAssistance />
        <Components.CommentsList
          currentUser={currentUser}
          comments={comments}
          highlightDate={this.state.highlightDate}
          post={post}
        />
        {!currentUser &&
          <div>
            <Components.ModalTrigger
              component={<a href="#"><FormattedMessage id="comments.please_log_in"/></a>}
            size="small">
              <Components.AccountsLoginForm/>
            </Components.ModalTrigger>
          </div>
        }
        {currentUser && Users.isAllowedToComment(currentUser, post) &&
          <div className="posts-comments-thread-new">
            <h4><FormattedMessage id="comments.new"/></h4>
            <Components.CommentsNewForm
              postId={postId}
              prefilledProps={{af: Comments.defaultToAlignment(currentUser, post)}}
              type="comment"
            />
          </div>
        }
        {currentUser && !Users.isAllowedToComment(currentUser, post) && (
          <div className="i18n-message author_has_banned_you">
            { Users.blockedCommentingReason(currentUser, post)}
            { !(getSetting('AlignmentForum', false)) && <span>
              (Questions? Send an email to <a className="email-link" href="mailto:moderation@lesserwrong.com">moderation@lesserwrong.com</a>)
            </span> }
          </div>
        )}
      </div>
    );
  }
}



registerComponent("CommentsListSection", CommentsListSection, withCurrentUser, withRouter);
export default CommentsListSection
