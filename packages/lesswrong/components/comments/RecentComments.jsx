import React, { Component } from 'react';
import { Components, registerComponent, withList, withCurrentUser, Loading, withEdit } from 'meteor/vulcan:core';
import { Comments } from 'meteor/example-forum';

const RecentComments = ({results, currentUser, loading, fontSize, loadMore, networkStatus, editMutation}) => {
  const loadingMore = networkStatus === 2;
  return (
    <div>
      <div className="comments-list recent-comments-list">
        {loading || !results ? <Loading /> :
        <div className={"comments-items" + (fontSize == "small" ? " smalltext" : "")}>
          {results.map(comment =>
            <div key={comment._id}>
              <Components.RecentCommentsItem
                currentUser={currentUser}
                comment={comment}
                editMutation={editMutation}/>
            </div>
          )}
          <Components.CommentsLoadMore loading={loadingMore || loading} loadMore={loadMore}  />
        </div>}
      </div>
    </div>)
  }

const commentsOptions = {
  collection: Comments,
  queryName: 'selectCommentsListQuery',
  fragmentName: 'SelectCommentsList',
  totalResolver: false,
};

const withEditOptions = {
  collection: Comments,
  fragmentName: 'SelectCommentsList',
};

registerComponent('RecentComments', RecentComments, [withList, commentsOptions], [withEdit, withEditOptions], withCurrentUser);
