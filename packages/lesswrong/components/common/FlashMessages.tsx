import { registerComponent } from '../../lib/vulcan-lib';
import { useMessages } from './withMessages';
import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';

const FlashMessages = () => {
  const getProperties = (message) => {
    if (typeof message === 'string') {
      // if error is a string, use it as message
      return {
        message: message,
        type: 'error'
      }
    } else {
      // else return full error object after internationalizing message
      const { messageString } = message;
      return {
        ...message,
        message: messageString,
      };
    }
  }

  const { messages, clear } = useMessages();
  let messageObject = messages.length > 0 && getProperties(messages[0]);
  return (
    <div className="flash-messages">
      <Snackbar
        open={messageObject && !messageObject.hide}
        message={messageObject && messageObject.message}
        autoHideDuration={6000}
        onClose={clear}
        action={messageObject?.action && <Button onClick={messageObject?.action} color="primary">{messageObject?.actionName || "UNDO"}</Button>}
      />
    </div>
  );
}

const FlashMessagesComponent = registerComponent('FlashMessages', FlashMessages);

declare global {
  interface ComponentTypes {
    FlashMessages: typeof FlashMessagesComponent
  }
}
