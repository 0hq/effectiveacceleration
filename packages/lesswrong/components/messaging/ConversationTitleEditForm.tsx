/*

A component to configure the "Edit Title" form.

*/

import React from 'react';
import { Components, registerComponent, getFragment } from "../../lib/vulcan-lib";
import Conversations from '../../lib/collections/conversations/collection';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const ConversationTitleEditForm = ({onClose, documentId}: {
  onClose: ()=>void,
  documentId: string,
}) =>{
  return <Components.LWDialog open onClose={onClose}>
      <DialogTitle>Conversation Options</DialogTitle>
      <DialogContent>
        <Components.WrappedSmartForm
          collection={Conversations}
          documentId={documentId}
          fragment={getFragment('conversationsListFragment')}
          queryFragment={getFragment('conversationsListFragment')}
          mutationFragment={getFragment('conversationsListFragment')}
          successCallback={document => {
            onClose();
          }}
        />
      </DialogContent>
    </Components.LWDialog>
}

const ConversationTitleEditFormComponent = registerComponent('ConversationTitleEditForm', ConversationTitleEditForm);

declare global {
  interface ComponentTypes {
    ConversationTitleEditForm: typeof ConversationTitleEditFormComponent
  }
}

