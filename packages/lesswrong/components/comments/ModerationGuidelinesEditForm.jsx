import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Components, registerComponent, getFragment } from 'meteor/vulcan:core';
import { Posts } from '../../lib/collections/posts'
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  formButton: {
    paddingBottom: "2px",
    fontSize: "16px",
    marginLeft: "5px",
    "&:hover": {
      background: "rgba(0,0,0, 0.05)",
    }
  },
  submitButton: {
    color: theme.palette.secondary.main,
    float: 'right'
  },
});

class ModerationGuidelinesEditForm extends PureComponent {
  render() {
    const { postId, onClose, classes } = this.props
    const SubmitComponent = ({submitLabel = "Submit"}) => {
      return <div className="form-submit">
        <Button
          type="submit"
          className={classNames("primary-form-submit-button", classes.formButton, classes.submitButton)}
        >
          {submitLabel}
        </Button>
      </div>
    }
    return (
      <Dialog
        modal={false}
        open={true}
        onClose={onClose}
      >
        <DialogContent>
          <Components.SmartForm
            collection={Posts}
            documentId={postId}
            fields={['moderationGuidelinesContent', 'moderationGuidelinesBody', 'moderationStyle']}
            mutationFragment={getFragment("LWPostsPage")}
            successCallback={onClose}
            SubmitComponent={SubmitComponent}
            GroupComponent={FormGroupComponent}
          />
        </DialogContent>
      </Dialog>
    )
  }
}

const FormGroupComponent = (props) => {
  return <React.Fragment>
    {props.fields.map(field => (
      <Components.FormComponent
        key={field.name}
        disabled={props.disabled}
        {...field}
        errors={props.errors}
        throwError={props.throwError}
        currentValues={props.currentValues}
        updateCurrentValues={props.updateCurrentValues}
        deletedValues={props.deletedValues}
        addToDeletedValues={props.addToDeletedValues}
        clearFieldErrors={props.clearFieldErrors}
        formType={props.formType}
        currentUser={props.currentUser}
      />
    ))}
  </React.Fragment>
}

ModerationGuidelinesEditForm.propTypes = {
  postId: PropTypes.string,
}

registerComponent('ModerationGuidelinesEditForm', ModerationGuidelinesEditForm, withStyles(styles, { name: "ModerationGuidelinesEditForm" }));
