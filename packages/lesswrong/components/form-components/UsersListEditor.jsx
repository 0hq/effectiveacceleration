import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { registerComponent, Components } from 'meteor/vulcan:core';
import { withStyles } from '@material-ui/core/styles';
import withUser from '../common/withUser';


const sortableItemStyles = theme => ({
  root: {
    listStyle: "none",
    fontFamily: theme.typography.fontFamily
  }
})

// React sortable has constructors that don't work like normal constructors
//eslint-disable-next-line babel/new-cap
const SortableItem = withStyles(sortableItemStyles, {name: "SortableItem"})(SortableElement(({userId, currentUser, removeItem, classes}) =>
  <li className={classes.root}>
    <Components.SingleUsersItemWrapper documentId={userId} currentUser={currentUser} removeItem={removeItem} />
  </li>
))


const sortableListStyles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  }
})
// React sortable has constructors that don't work like normal constructors
//eslint-disable-next-line babel/new-cap
const SortableList = withStyles(sortableListStyles, {name: "SortableList"})(SortableContainer(({items, currentUser, removeItem, classes}) => {
  return (
    <div className={classes.root}>
      {items.map((userId, index) => (
        <SortableItem key={`item-${index}`} removeItem={removeItem} index={index} userId={userId} currentUser={currentUser}/>
      ))}
    </div>
  );
}));

const usersListEditorStyles = theme => ({
  root: {
    display: "flex"
  }
})

class UsersListEditor extends Component {
  onSortEnd = ({oldIndex, newIndex}) => {
    const newIds = arrayMove(this.props.value, oldIndex, newIndex);
    this.context.updateCurrentValues({[this.props.path]: newIds});
  };
  addUserId = (userId) => {
    const newIds = [...this.props.value, userId];
    this.context.updateCurrentValues({[this.props.path]: newIds});
  }
  removeUserId = (userId) => {
    const newIds = _.without(this.props.value, userId);
    this.context.updateCurrentValues({[this.props.path]: newIds});
  }
  shouldCancelStart = (e) => {
    // Cancel sorting if the event target is an `input`, `textarea`, `select`, 'option' or 'svg'
    const disabledElements = [
      'input',
      'textarea',
      'select',
      'option',
      'button',
      'svg',
      'path'
    ];
    if (disabledElements.includes(e.target.tagName.toLowerCase())) {
      return true; // Return true to cancel sorting
    }
  }

  render() {
    const { classes, label, currentUser } = this.props

    return (
      <div className={classes.root}>
        <Components.ErrorBoundary>
          <Components.UsersSearchAutoComplete
            clickAction={this.addUserId}
            label={label}
          />
        </Components.ErrorBoundary>
        <SortableList
          axis="xy"
          items={this.props.value}
          onSortEnd={this.onSortEnd}
          currentUser={currentUser}
          removeItem={this.removeUserId}
          shouldCancelStart={this.shouldCancelStart}
        />
      </div>
    )
  }
}

UsersListEditor.contextTypes = {
  updateCurrentValues: PropTypes.func,
};

registerComponent("UsersListEditor", UsersListEditor,
  withUser,
  withStyles(usersListEditorStyles, { name: "UsersListEditor" })
);
