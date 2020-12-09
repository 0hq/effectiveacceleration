import React from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Components, getFragment, registerComponent } from '../../lib/vulcan-lib';
import { TagFlags } from '../../lib/collections/tagFlags/collection';

const TagFlagEditAndNewForm = ({ tagFlagId, onClose, classes }: {
  tagFlagId: string,
  onClose: () => void,
  classes: ClassesType,
}) => {
  const { LWDialog } = Components;
  return (
    <LWDialog
      open={true}
      onClose={onClose}
    >
      <DialogTitle>
        {tagFlagId ? "Edit Tag Flag" : "Create Tag Flag"}
      </DialogTitle>
      <DialogContent>
        <Components.WrappedSmartForm
          collection={TagFlags}
          documentId={tagFlagId}
          queryFragment={getFragment("TagFlagEditFragment")}
          mutationFragment={getFragment("TagFlagFragment")}
          successCallback={onClose}
        />
      </DialogContent>
    </LWDialog>
  )
}

const TagFlagEditAndNewFormComponent = registerComponent('TagFlagEditAndNewForm', TagFlagEditAndNewForm);

declare global {
  interface ComponentTypes {
    TagFlagEditAndNewForm: typeof TagFlagEditAndNewFormComponent
  }
}
