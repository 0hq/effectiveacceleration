import { Components, registerComponent, withDocument} from 'meteor/vulcan:core';
import Sequences from '../../lib/collections/sequences/collection.js';
import React from 'react';
import DragIcon from '@material-ui/icons/DragHandle';
import RemoveIcon from '@material-ui/icons/Close';


const SequencesListEditorItem = ({document, loading, documentId, ...props}) => {
  if (document && !loading) {
    return <div>
      <DragIcon className="drag-handle"/>
      <div className="sequences-list-edit-item-box">
        <div className="sequences-list-edit-item-title">
          {document.title || "Undefined Title"}
        </div>
        <div className="sequences-list-edit-item-meta">
          <div className="sequences-list-edit-item-author">
            {document.user && document.user.displayName || "Undefined Author"}
          </div>
          <div className="sequences-list-edit-item-karma">
            {document.karma || "undefined"} points
          </div>
          <div className="sequences-list-edit-item-comments">
            {document.commentCount || "?"} comments
          </div>
          <div className="sequences-list-edit-item-remove">
            <RemoveIcon className="remove-icon" onClick={() => props.removeItem(documentId)} />
          </div>
        </div>
      </div>
    </div>
  } else {
    return <Components.Loading />
  }
};

const options = {
  collection: Sequences,
  queryName: "SequencesListEditorQuery",
  fragmentName: 'SequencesPageFragment',
};

registerComponent('SequencesListEditorItem', SequencesListEditorItem, [withDocument, options]);
