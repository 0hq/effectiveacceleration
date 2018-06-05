/*

Component for displaying details about currently selected conversation

*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import { Components, registerComponent, ModalTrigger, withCurrentUser } from 'meteor/vulcan:core';

class ConversationDetails extends Component {

  render() {

    const conversation = this.props.conversation;

    if(conversation && conversation.participants.length) {
      return (
        <div className="conversation-details">
          <ListGroup>
            <ListGroupItem> Title: {conversation.title}</ListGroupItem>
            <ListGroupItem> ID: {conversation._id}</ListGroupItem>
            <ListGroupItem> latestActivity: {conversation.latestActivity}</ListGroupItem>
            <ListGroupItem> Participants:
              {conversation.participants.map((user) => <div key={user._id}>{user.username} <Components.UsersAvatar user={user} /></div>)}
            </ListGroupItem>

            <ListGroupItem>Created At: {conversation.createdAt}</ListGroupItem>
            <ListGroupItem>More information about current conversation will be implemented soon!</ListGroupItem>
            <ListGroupItem>
              <Components.ModalTrigger label="Edit Title" >
                <Components.TitleEditForm documentId={conversation._id} currentUser={this.props.currentUser} />
              </Components.ModalTrigger>
              </ListGroupItem>
          </ListGroup>
        </div>
      )
    } else {
      return <Components.Loading />
    }
  }



}

registerComponent('ConversationDetails', ConversationDetails, withCurrentUser);
