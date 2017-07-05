import { Components, replaceComponent } from 'meteor/vulcan:core';
import React from 'react';
import { FormattedMessage } from 'meteor/vulcan:i18n';

const CommentsList = ({comments, currentUser, lastVisitDate}) => {
  if (comments) {
    return (
      <div className="comments-list">
        {comments.map(comment => <Components.CommentsNode currentUser={currentUser} comment={comment} key={comment._id} newComment={lastVisitDate && (comment.postedAt > lastVisitDate)}/>)}
        {/*hasMore ? (ready ? <Components.CommentsLoadMore loadMore={loadMore} count={count} totalCount={totalCount} /> : <Components.Loading/>) : null*/}
      </div>
    )
  } else {
    return (
      <div className="comments-list">
        <p>
          <FormattedMessage id="comments.no_comments"/>
        </p>
      </div>
    )
  }

};

CommentsList.displayName = "CommentsList";

replaceComponent('CommentsList', CommentsList);
