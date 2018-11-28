import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { registerComponent, Components } from 'meteor/vulcan:core';
import withUser from '../common/withUser';


// React sortable has constructors that don't work like normal constructors
//eslint-disable-next-line babel/new-cap
const SortableItem = SortableElement(({postId, currentUser, removeItem}) =>
  <li className="posts-list-editor-item">
    <Components.PostsItemWrapper documentId={postId} currentUser={currentUser} removeItem={removeItem} />
  </li>
);

// React sortable has constructors that don't work like normal constructors
//eslint-disable-next-line babel/new-cap
const SortableList = SortableContainer(({items, currentUser, removeItem}) => {
  return (
    <div>
      {items.map((postId, index) => (
        <SortableItem key={`item-${index}`} removeItem={removeItem} index={index} postId={postId} currentUser={currentUser}/>
      ))}
    </div>
  );
});

class PostsListEditor extends Component {
  constructor(props, context) {
    super(props, context);
    const fieldName = props.name;
    let postIds = [];
    if (props.document[fieldName]) {
      postIds = JSON.parse(JSON.stringify(props.document[fieldName]));
    }
    this.state = {
      postIds: postIds,
    }
    const addValues = this.context.updateCurrentValues;
    addValues({[fieldName]: postIds});

    const addToSuccessForm = this.context.addToSuccessForm;
    addToSuccessForm((results) => this.resetPostIds(results));
  }
  onSortEnd = ({oldIndex, newIndex}) => {
    const fieldName = this.props.name;
    const addValues = this.context.updateCurrentValues;
    const newIds = arrayMove(this.state.postIds, oldIndex, newIndex);
    this.setState({
      postIds: newIds,
    });
    addValues({[fieldName]: newIds});
  };
  addPostId = (postId) => {
    const newIds = [...this.state.postIds, postId];
    this.setState({
      postIds: newIds,
    })
    const fieldName = this.props.name;
    const addValues = this.context.updateCurrentValues;
    addValues({[fieldName]: newIds});
  }
  removePostId = (postId) => {
    const newIds = _.without(this.state.postIds, postId);
    this.setState({
      postIds: newIds,
    })
    const fieldName = this.props.name;
    const addValues = this.context.updateCurrentValues;
    addValues({[fieldName]: newIds});
  }
  resetPostIds = (args) => {
    this.setState({
      postIds: [],
    })
    return args;
  }

  shouldCancelStart = (e) => {
    // Cancel sorting if the event target is an `input`, `textarea`, `select`, 'option' or 'svg'
    const disabledElements = ['input', 'textarea', 'select', 'option', 'button', 'svg', 'path'];
    if (disabledElements.includes(e.target.tagName.toLowerCase())) {
      return true; // Return true to cancel sorting
    }
  }

  render() {
    return <div className="posts-list-editor">
      <SortableList
        items={this.state.postIds}
        onSortEnd={this.onSortEnd}
        currentUser={this.props.currentUser}
        removeItem={this.removePostId}
        shouldCancelStart={this.shouldCancelStart}
      />
      <Components.PostsSearchAutoComplete
        clickAction={this.addPostId}
        HitComponent={Components.PostsListEditorSearchHit}
      />
    </div>
  }
}

//

PostsListEditor.contextTypes = {
  updateCurrentValues: PropTypes.func,
  addToSuccessForm: PropTypes.func,
};

// TODO: Does not work in nested contexts because it doesn't use the
// vulcan-forms APIs correctly.
registerComponent("PostsListEditor", PostsListEditor, withUser);
