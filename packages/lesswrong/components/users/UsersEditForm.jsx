import { Components, registerComponent, withCurrentUser, withMessages, getFragment } from 'meteor/vulcan:core';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'meteor/vulcan:i18n';
import Users from 'meteor/vulcan:users';
import Button from '@material-ui/core/Button';
import { Accounts } from 'meteor/accounts-base';
import { withRouter } from 'react-router'
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  header: {
    margin: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 4
  },
  resetButton: {
    marginBottom:theme.spacing.unit * 4
  }
})

const UsersEditForm = (props) => {

  const { classes } = props

  return (
    <Components.ShowIf
      check={Users.options.mutations.edit.check}
      document={props.terms.documentId ? {_id: props.terms.documentId} : {slug: props.terms.slug}}
      failureComponent={<FormattedMessage id="app.noPermission"/>}
    >
      <div className="page users-edit-form">
        <Typography variant="display2" className={classes.header}><FormattedMessage id="users.edit_account"/></Typography>
        <Button color="secondary" className={classes.resetButton } onClick={() => Accounts.forgotPassword({ email: props.currentUser.email },
            (error) => props.flash(error ? error.reason : "Sent password reset email to " + props.currentUser.email))
          }>
          Reset Password
        </Button>
        {/* <div className="change-password-link">
          <Components.ModalTrigger size="small" component={<a href="#"><FormattedMessage id="accounts.change_password" /></a>}>
            <Components.AccountsLoginForm formState={STATES.PASSWORD_CHANGE} />
          </Components.ModalTrigger>
        </div> */}

        <Components.SmartForm
          collection={Users}
          {...props.terms}
          successCallback={user => {
            props.flash({ id: 'users.edit_success', properties: {name: Users.getDisplayName(user)}, type: 'success'})
            props.router.push(Users.getProfileUrl(user));
          }}
          mutationFragment={getFragment('UsersProfile')}
          showRemove={false}
        />
      </div>
    </Components.ShowIf>
  );
};


UsersEditForm.propTypes = {
  terms: PropTypes.object, // a user is defined by its unique _id or its unique slug
};

UsersEditForm.contextTypes = {
  intl: intlShape
};

UsersEditForm.displayName = 'UsersEditForm';

registerComponent('UsersEditForm', UsersEditForm,
  withMessages, withCurrentUser, withRouter,
  withStyles(styles, { name: "UsersEditForm" })
);
