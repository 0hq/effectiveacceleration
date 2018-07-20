import { Components, registerComponent, withDocument} from 'meteor/vulcan:core';
import { Posts } from 'meteor/example-forum';
import React from 'react';
import DragIcon from '@material-ui/icons/DragHandle';
import RemoveIcon from '@material-ui/icons/Close';


const PostsItemWrapper = ({document, loading, ...props}) => {
  if (document && !loading) {
    return <div>
      <DragIcon className="drag-handle"/>
      <div className="posts-list-edit-item-box">
        <div className="posts-list-edit-item-title">
          {document.title}
        </div>
        <div className="posts-list-edit-item-meta">
          <div className="posts-list-edit-item-author">
            {document.user.displayName}
          </div>
          <div className="posts-list-edit-item-karma">
            {document.baseScore} points
          </div>
          <div className="posts-list-edit-item-comments">
            {document.commentCount} comments
          </div>
          <div className="posts-list-edit-item-remove">
            <RemoveIcon className="remove-icon" onClick={() => props.removeItem(document._id)} />
          </div>
        </div>
      </div>
    </div>
  } else {
    return <Components.Loading />
  }
};

const options = {
  collection: Posts,
  queryName: "PostsItemWrapperQuery",
  fragmentName: 'PostsList',
  totalResolver: false,
};

registerComponent('PostsItemWrapper', PostsItemWrapper, [withDocument, options]);
