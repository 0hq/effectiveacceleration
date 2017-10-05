/*

Display of a single message in the Conversation Wrapper

*/

import React, { PropTypes, Component } from 'react';
import { Media } from 'react-bootstrap';
import { Components, registerComponent } from 'meteor/vulcan:core';

class MessageItem extends Component {

  render() {
    const currentUser = this.props.currentUser;
    const message = this.props.message;

    if (message.content) {
      return (
        <Media>
          {(message.user && currentUser._id != message.user._id) ? <Media.Left> <Components.UsersAvatar user={message.user}/> </Media.Left> : <div></div>}
          <Media.Body>
            <Components.ContentRenderer state={message.content} />
          </Media.Body>
          {(message.user && currentUser._id == message.user._id) ? <Media.Right> <Components.UsersAvatar user={currentUser}/></Media.Right> : <div></div>}
        </Media>
      )
    } else {
      return (<Components.Loading />)
    }

  }

}


registerComponent('MessageItem', MessageItem);
