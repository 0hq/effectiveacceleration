import { Components, registerComponent, getFragment, withMessages } from 'meteor/vulcan:core';
import React from 'react';
import Chapters from '../../lib/collections/chapters/collection.js';

//TODO: Manage chapter removal to remove the reference from all parent-sequences

const ChaptersEditForm = (props) => {
  return (
    <div className="chapters-edit-form">
      <h3>Add/Remove Posts</h3>
      <Components.WrappedSmartForm
        collection={Chapters}
        documentId={props.documentId}
        successCallback={props.successCallback}
        cancelCallback={props.cancelCallback}
        showRemove={true}
        fragment={getFragment('ChaptersFragment')}
        queryFragment={getFragment('ChaptersFragment')}
        mutationFragment={getFragment('ChaptersFragment')}
      />
    </div>
  )
}

registerComponent('ChaptersEditForm', ChaptersEditForm, withMessages);
