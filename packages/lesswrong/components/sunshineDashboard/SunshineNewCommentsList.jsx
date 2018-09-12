import { Components, registerComponent, withList, withCurrentUser } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import { Comments } from 'meteor/example-forum';

class SunshineNewCommentsList extends Component {
  render () {
    const { results } = this.props
    if (results && results.length) {
      return (
        <div className="sunshine-new-comments-list">
          <Components.SunshineListTitle>Unreviewed Comments</Components.SunshineListTitle>
          {this.props.results.map(comment =>
            <div key={comment._id} >
              <Components.SunshineCommentsItem comment={comment}/>
            </div>
          )}
        </div>
      )
    } else {
      return null
    }
  }
}

const withListOptions = {
  collection: Comments,
  queryName: 'sunshineNewCommentsListQuery',
  fragmentName: 'SelectCommentsList',
};

registerComponent(
  'SunshineNewCommentsList',
  SunshineNewCommentsList,
  [withList, withListOptions],
  withCurrentUser
);
