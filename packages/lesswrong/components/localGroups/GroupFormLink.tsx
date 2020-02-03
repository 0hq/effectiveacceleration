import { Components, registerComponent } from '../../lib/vulcan-lib';
import React, { Component } from 'react';
import AddLocationIcon from '@material-ui/icons/AddLocation';
import withDialog from '../common/withDialog'

interface ExternalProps {
  documentId?: string,
}
interface GroupFormLinkProps extends ExternalProps, WithDialogProps {
}

class GroupFormLink extends Component<GroupFormLinkProps> {
  handleOpenGroupForm = () => {
    this.props.openDialog({
      componentName: "GroupFormDialog",
      componentProps: {documentId: this.props.documentId}
    })
  }

  render() {
    const { documentId } =  this.props
    const { SectionButton } = Components
    return (<React.Fragment>
      { documentId ?
        <SectionButton>
          <span onClick={this.handleOpenGroupForm}>Edit Group</span>
        </SectionButton>
        :
        <SectionButton>
          <AddLocationIcon />
          <span onClick={this.handleOpenGroupForm}>New Group</span>
        </SectionButton>
      }
    </React.Fragment>)
  }
}

const GroupFormLinkComponent = registerComponent<ExternalProps>('GroupFormLink', GroupFormLink, {
  hocs: [withDialog]
});

declare global {
  interface ComponentTypes {
    GroupFormLink: typeof GroupFormLinkComponent
  }
}

