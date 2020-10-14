import { Components, registerComponent, getFragment } from '../../lib/vulcan-lib';
import { withMessages } from '../common/withMessages';
import React from 'react';
import PropTypes from 'prop-types';
import Users from '../../lib/collections/users/collection';
import Button from '@material-ui/core/Button';
import { Accounts } from 'meteor/accounts-base';
import Typography from '@material-ui/core/Typography';
import withUser from '../common/withUser';
import { withApollo } from 'react-apollo'
import { useNavigation } from '../../lib/routeUtil';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    width: "60%",
    maxWidth: 600,
    margin: "auto",
    marginBottom: 100,
    [theme.breakpoints.down('xs')]: {
      width: "100%",
    }
  },

  header: {
    margin: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 4,
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing.unit/2,
    },
  },
  resetButton: {
    marginBottom:theme.spacing.unit * 4
  }
})

const UsersEditForm = (props) => {
  const { classes, terms, currentUser, client } = props
  const { history } = useNavigation();

  if(!terms.slug && !terms.documentId) {
    // No user specified and not logged in
    return (
      <div className={classes.root}>
        Log in to edit your profile.
      </div>
    );
  }
  if (!Users.canEdit(currentUser,
    terms.documentId ? {_id: terms.documentId} : {slug: terms.slug})) {
    return <span>Sorry, you do not have permission to do this at this time.</span>
  }

  // currentUser will not be the user being edited in the case where current
  // user is an admin. This component does not have access to the user email at
  // all in admin mode unfortunately. In the fullness of time we could fix that,
  // currently we disable it below
  const requestPasswordReset = () => Accounts.forgotPassword(
    { email: props.currentUser.email },
    (error) => props.flash({
      messageString: error ?
      error.reason :
      // TODO: This doesn't seem to display
      "Sent password reset email to " + props.currentUser.email
    })
  )

  // Since there are two urls from which this component can be rendered, with different terms, we have to
  // check both slug and documentId
  const isCurrentUser = (props.terms.slug && props.terms.slug === props.currentUser.slug) || (props.terms.documentId && props.terms.documentId === props.currentUser._id)

  return (
    <div className={classes.root}>
      <Typography variant="display2" className={classes.header}>Edit Account</Typography>
      {isCurrentUser && <Button
        color="secondary"
        variant="outlined"
        className={classes.resetButton}
        onClick={requestPasswordReset}
      >
        Reset Password
      </Button>}

      <Components.WrappedSmartForm
        collection={Users}
        {...terms}
        successCallback={user => {
          props.flash({ id: 'users.edit_success', properties: {name: Users.getDisplayName(user)}, type: 'success'})
          client.resetStore()
          history.push(Users.getProfileUrl(user));
        }}
        queryFragment={getFragment('UsersEdit')}
        mutationFragment={getFragment('UsersEdit')}
        showRemove={false}
      />
    </div>
  );
};


UsersEditForm.propTypes = {
  terms: PropTypes.object, // a user is defined by its unique _id or its unique slug
};

const UsersEditFormComponent = registerComponent('UsersEditForm', UsersEditForm, {
  styles,
  hocs: [withMessages, withUser, withApollo]
});

declare global {
  interface ComponentTypes {
    UsersEditForm: typeof UsersEditFormComponent
  }
}
