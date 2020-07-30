import React, { PureComponent } from 'react';
import { registerComponent } from '../../lib/vulcan-lib';
import { withUpdate } from '../../lib/crud/withUpdate';
import Users from '../../lib/collections/users/collection';
import Button from '@material-ui/core/Button';
import withUser from '../common/withUser';
import withErrorBoundary from '../common/withErrorBoundary';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    ...theme.typography.body2,
    marginLeft: theme.spacing.unit
  },
  verifyEmailButton: {
    marginTop: theme.spacing.unit
  }
});

interface ExternalProps {
  resend?: boolean,
}
interface UsersEmailVerificationProps extends ExternalProps, WithUserProps, WithUpdateUserProps, WithStylesProps {
}
interface UsersEmailVerificationState {
  emailSent: boolean,
}

class UsersEmailVerification extends PureComponent<UsersEmailVerificationProps,UsersEmailVerificationState>
{
  constructor(props: UsersEmailVerificationProps) {
    super(props);
    this.state = {
      emailSent: false,
    };
  }

  sendConfirmationEmail() {
    const { updateUser, currentUser } = this.props;
    if (!currentUser) return;
    updateUser({
      selector: {_id: currentUser._id},
      data: { whenConfirmationEmailSent: new Date() }
    });
    this.setState({
      emailSent: true
    });
  }

  render() {
    let { resend=false, currentUser, classes } = this.props;
    
    if(Users.emailAddressIsVerified(currentUser)) {
      return (
        <div className={classes.root}>
          Your email address is verified.
        </div>
      );
    } else if(this.state.emailSent) {
      return (
        <div className={classes.root}>
          Check your email for a confirmation link.
        </div>
      );
    } else {
      return (
        <div className={classes.root}>
          <div>You need to verify your email address to enable email notifications.</div>
          <Button color="secondary" variant="outlined"
            className={classes.verifyEmailButton}
            onClick={() => this.sendConfirmationEmail()}
          >
            {resend ? "Resend Confirmation Email"
                    : "Send Confirmation Email"}
          </Button>
        </div>
      );
    }
  }
}


const UsersEmailVerificationComponent = registerComponent<ExternalProps>('UsersEmailVerification', UsersEmailVerification, {
  styles,
  hocs: [
    withErrorBoundary,
    withUser,
    withUpdate({
      collection: Users,
      fragmentName: 'UsersCurrent',
    }),
  ]
});

declare global {
  interface ComponentTypes {
    UsersEmailVerification: typeof UsersEmailVerificationComponent
  }
}
