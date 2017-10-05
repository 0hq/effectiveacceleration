/*

The Navigation for the Inbox components

*/

import React, { PropTypes, Component } from 'react';
import { PageHeader } from 'react-bootstrap';
import { Components, registerComponent, withList, withCurrentUser } from 'meteor/vulcan:core';
import Messages from "../../lib/collections/messages/collection.js";

class ConversationWrapper extends Component {

  renderMessages(results, currentUser) {
    if (results && results.length) {
      return (
        <div>
          {results.map((message) => (<Components.MessageItem key={message._id} currentUser={currentUser} message={message} />))}
        </div>);
    } else {
     return <div>There are no messages in  this conversation yet!</div>
    }
  }

  render() {

    const results = this.props.results;
    const currentUser = this.props.currentUser;
    const refetch = this.props.refetch;
    const loading = this.props.loading;
    const conversation = this.props.conversation;

    if (loading) {
      return (<Components.Loading/>)
    } else if (conversation) {
      //TODO: Clean up the CSS for this component id:17
      return (
        <div>
          <PageHeader>
            {!!conversation.title ? conversation.title : _.pluck(conversation.participants, 'username').join(', ')}
            <br /> <small>{conversation.createdAt}</small>
          </PageHeader>
          {this.renderMessages(results, currentUser)}
            <Components.SmartForm
              collection={Messages}
              prefilledProps={ {conversationId: conversation._id} }
              successCallback={(message) => {refetch()}}
              errorCallback={(message)=> console.log("Failed to send", error)}
            />
        </div>
      )
    } else {
      return <div>No Conversation Selected</div>
    }
  }
}

const options = {
  collection: Messages,
  queryName: 'messagesForConversation',
  fragmentName: 'messageListFragment',
  limit: 50,
  totalResolver: false,
};

registerComponent('ConversationWrapper', ConversationWrapper, [withList, options], withCurrentUser);
