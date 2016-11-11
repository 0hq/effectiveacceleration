import Telescope from 'meteor/nova:lib';
import React from 'react';
import {FormattedMessage } from 'react-intl';
import { ModalTrigger } from 'meteor/nova:core';
import Comments from 'meteor/nova:comments';
import { withCommentsList } from 'meteor/nova:base-containers';

const PostsCommentsThread = (props, context) => {

  const {loading, postId, results} = props;

  if (loading) {
  
    return <div className="posts-comments-thread"><Telescope.components.Loading/></div>
  
  } else {

    const commentCount = results.length;

    const resultsClone = _.map(results, _.clone); // we don't want to modify the objects we got from props
    const nestedComments = Telescope.utils.unflatten(resultsClone, '_id', 'parentCommentId');

    return (
      <div className="posts-comments-thread">
        <h4 className="posts-comments-thread-title"><FormattedMessage id="comments.comments"/></h4>
        <Telescope.components.CommentsList comments={nestedComments} commentCount={commentCount}/>
        { context.currentUser ?
          <div className="posts-comments-thread-new">
            <h4><FormattedMessage id="comments.new"/></h4>
            <Telescope.components.CommentsNewForm
              postId={postId} 
              type="comment" 
            />
          </div> :
          <div>
            <ModalTrigger size="small" component={<a><FormattedMessage id="comments.please_log_in"/></a>}>
              <Telescope.components.UsersAccountForm/>
            </ModalTrigger>
          </div> 
        }
      </div>
    );
  }
};

PostsCommentsThread.displayName = "PostsCommentsThread";

PostsCommentsThread.contextTypes = {
  currentUser: React.PropTypes.object
};

module.exports = withCommentsList()(PostsCommentsThread);
export default withCommentsList()(PostsCommentsThread);
