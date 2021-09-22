import React, {useState, useEffect, useRef} from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useCurrentUser } from '../common/withUser';
import { useUpdateCurrentUser } from '../hooks/useUpdateCurrentUser';
import { userEmailAddressIsVerified, userHasEmailAddress } from '../../lib/collections/users/helpers';
import { useMessages } from '../common/withMessages';
import { getGraphQLErrorID, getGraphQLErrorMessage } from '../../lib/utils/errorUtil';
import { randInt } from '../../lib/random';
import SimpleSchema from 'simpl-schema';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import MailOutline from '@material-ui/icons/MailOutline'
import CheckRounded from '@material-ui/icons/CheckRounded'
import withErrorBoundary from '../common/withErrorBoundary'
import { AnalyticsContext, useTracking } from "../../lib/analyticsEvents";
import { forumTypeSetting } from '../../lib/instanceSettings';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    marginBottom: theme.spacing.unit*4,
    position: "relative",
    backgroundColor: "rgba(253,253,253)",
    
    padding: 16,
    ...theme.typography.body2,
    boxShadow: theme.boxShadow,

    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: 500,
  },
  adminNotice: {
    fontStyle: "italic",
    textAlign: "left",
    marginTop: 22,
    fontSize: 12,
    lineHeight: 1.3,
  },
  loginForm: {
    margin: "0 auto",
    maxWidth: 252,
  },
  message: {
    display: "flex",
    alignItems: "flex-start",
    fontSize: 18,
    lineHeight: 1.75,
  },
  messageDescription: {
    fontSize: 12,
    marginTop: 8
  },
  mailIcon: {
    marginTop: 4,
    marginRight: 12
  },
  checkIcon: {
    color: "#4caf50",
    marginTop: 4,
    marginRight: 12
  },
  emailInput: {
    marginTop: 18
  },
  subscribeButton: {
    margin: "18px auto 0",
    display: "block",
    background: theme.palette.primary.main,
    color: "white",
    fontSize: 15
  },
  buttons: {
    marginTop: 16,
    textAlign: "right",
  },
  maybeLaterButton: {
  },
  dontAskAgainButton: {
  },
});

const RecentDiscussionSubscribeReminder = ({classes}: {
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const updateCurrentUser = useUpdateCurrentUser();
  const [hide, setHide] = useState(false);
  const [subscribeChecked, setSubscribeChecked] = useState(true);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [subscriptionConfirmed, setSubscriptionConfirmed] = useState(false);
  const emailAddressInput = useRef<HTMLInputElement|null>(null);
  const [loading, setLoading] = useState(false);
  const { flash } = useMessages();
  const {WrappedLoginForm, SignupSubscribeToCurated, Loading, AnalyticsInViewTracker } = Components;
  const subscriptionDescription = '(2-3 posts per week, selected by the LessWrong moderation team.)';
  const { captureEvent } = useTracking({eventProps: {pageElementContext: "subscribeReminder"}});
  
  // Show admins a random version of the widget. Makes sure we notice if it's intrusive/bad.
  const [adminBranch, setAdminBranch] = useState(-1);
  const adminUiMessage = currentUser?.isAdmin ? <div className={classes.adminNotice}>
    You are seeing this UI element because you're an admin. Admins are shown a random version of the
    subscribe-reminder even if they're already subscribed, to make sure it still works and isn't
    annoying.
  </div>: null
  
  useEffect(() => {
    if (adminBranch === -1 && currentUser?.isAdmin) {
      setAdminBranch(randInt(5)); // TODO; test for eaforum ? 4 : 5
    }
  }, [adminBranch, currentUser?.isAdmin]);

  // disable on AlignmentForum
  if (forumTypeSetting.get() === 'AlignmentForum') {
    return null;
  }

  // Placeholder to prevent SSR mismatch, changed on load.
  if (adminBranch === -1 && currentUser?.isAdmin)
    return <div/>

  // adjust functionality based on forum type
  let currentUserSubscribed = currentUser?.emailSubscribedToCurated;
  if (forumTypeSetting.get() === 'EAForum') {
    currentUserSubscribed = currentUser?.subscribedToDigest;
  }

  const maybeLaterButton = <Button
    className={classes.maybeLaterButton}
    onClick={() => {
      setHide(true)
      captureEvent("subscribeReminderButtonClicked",{buttonType: "maybeLaterButton"})
    }}
  >
    Maybe Later
  </Button>
  
  const dontAskAgainButton = <span>
    {currentUser && <Button
      className={classes.dontAskAgainButton}
      onClick={() => {
        void updateCurrentUser({hideSubscribePoke: true});
        setHide(true)
        captureEvent("subscribeReminderButtonClicked",{buttonType: "dontAskAgainButton"})
      }}
    >
      Don't Ask Again
    </Button>}
  </span>
  
  if (hide || currentUser?.hideSubscribePoke) {
    return null;
  }
  
  const updateAndMaybeVerifyEmail = async () => {
    setLoading(true);
    // subscribe to different emails based on forum type
    const userSubscriptionData: Partial<MakeFieldsNullable<DbUser>> = forumTypeSetting.get() === 'EAForum' ?
      {subscribedToDigest: true} : {emailSubscribedToCurated: true};
    // since they chose to subscribe to an email, make sure this is false
    userSubscriptionData.unsubscribeFromAll = false;

    // EA Forum does not care about email verification
    if (forumTypeSetting.get() !== 'EAForum' && !userEmailAddressIsVerified(currentUser)) {
      userSubscriptionData.whenConfirmationEmailSent = new Date();
    }

    try {
      await updateCurrentUser(userSubscriptionData);
      setSubscriptionConfirmed(true);
    } catch(e) {
      flash(getGraphQLErrorMessage(e));
    }

    setLoading(false);
  }
  
  const AnalyticsWrapper = ({children, branch}: {children: React.ReactNode, branch: string}) => {
    return <AnalyticsContext pageElementContext="subscribeReminder" branch={branch}>
      <AnalyticsInViewTracker eventProps={{inViewType: "subscribeReminder"}}>
        <div className={classes.root}>
          {children}
        </div>
      </AnalyticsInViewTracker>
    </AnalyticsContext>
  }
  
  // the EA Forum uses this prompt in most cases
  const eaForumSubscribePrompt = (
    <>
      <div className={classes.message}>
        <MailOutline className={classes.mailIcon} />
        Sign up for the Forum's email digest
      </div>
      <div className={classes.messageDescription}>
        Want a weekly email containing the best posts from the past week?
        Our moderator Aaron sends out a weekly digest of recent posts that
        have a lot of karma/discussion or seemed really good to him, as well
        as question posts that could use more answers.
      </div>
    </>
  );
  
  if (loading) {
    return <div className={classes.root}>
      <Loading/>
    </div>
  } else if (subscriptionConfirmed) {
    // Show the confirmation after the user subscribes
    const confirmText = forumTypeSetting.get() === 'EAForum' ?
      "You're subscribed to the EA Forum Digest!" :
      "You are subscribed to the best posts of LessWrong!"
    return <AnalyticsWrapper branch="already-subscribed">
      You are subscribed to the best posts of LessWrong!
      <div className={classes.message}>
        <CheckRounded className={classes.checkIcon} />
        {confirmText}
      </div>
    </AnalyticsWrapper>
  } else if (verificationEmailSent) {
    // Clicked Subscribe in one of the other branches, and a confirmation email
    // was sent. You need to verify your email address to complete the subscription.
    const yourEmail = currentUser?.emails[0]?.address;
    return <AnalyticsWrapper branch="needs-email-verification-subscribed-in-other-branch">
      <div className={classes.message}>
        We sent an email to {yourEmail}. Follow the link in the email to complete your subscription.
      </div>
    </AnalyticsWrapper>
  } else if (verificationEmailSent) {
    // Clicked Subscribe in one of the other branches, and a confirmation email
    // was sent. You need to verify your email address to complete the subscription.
    const yourEmail = currentUser?.emails[0]?.address;
    return <AnalyticsWrapper branch="needs-email-verification-subscribed-in-other-branch">
      <div className={classes.message}>
        We sent an email to {yourEmail}. Follow the link in the email to complete your subscription.
      </div>
    </AnalyticsWrapper>
  } else if (!currentUser || adminBranch===0) {
    // Not logged in. Show a create-account form and a brief pitch.
    const subscribeTextNode = forumTypeSetting.get() === 'EAForum' ? eaForumSubscribePrompt : (
      <div className={classes.message}>
        To get the best posts emailed to you, create an account! {subscriptionDescription}
      </div>
    );
    return <AnalyticsWrapper branch="logged-out">
      {subscribeTextNode}
      <div className={classes.loginForm}>
        <WrappedLoginForm startingState="signup" />
      </div>
      {adminUiMessage}
    </AnalyticsWrapper>
  } else if (!userHasEmailAddress(currentUser) || adminBranch===1) {
    const emailType = forumTypeSetting.get() === 'EAForum' ? 'our weekly digest email' : 'curated posts';
    // Logged in, but no email address associated. Probably a legacy account.
    // Show a text box for an email address, with a submit button and a subscribe
    // checkbox.
    return <AnalyticsWrapper branch="missing-email">
      <div className={classes.message}>
        Your account does not have an email address associated. Add an email address to subscribe to {emailType} and enable notifications.
      </div>
      
      <Input placeholder="Email address" inputRef={emailAddressInput} className={classes.emailInput} />
      <SignupSubscribeToCurated defaultValue={true} onChange={(checked: boolean) => setSubscribeChecked(true)}/>
      
      <div className={classes.buttons}>
        <Button className={classes.subscribeButton} onClick={async (ev) => {
          const emailAddress = emailAddressInput.current;
          if (emailAddress && SimpleSchema.RegEx.Email.test(emailAddress?.value)) {
            setLoading(true);
            try {
              // subscribe to different emails based on forum type
              const userSubscriptionData: Partial<MakeFieldsNullable<DbUser>> = forumTypeSetting.get() === 'EAForum' ?
                {subscribedToDigest: subscribeChecked} : {emailSubscribedToCurated: subscribeChecked};
              userSubscriptionData.email = emailAddress?.value;
              userSubscriptionData.unsubscribeFromAll = false;
              await updateCurrentUser(userSubscriptionData);

              if (forumTypeSetting.get() !== 'EAForum') {
                // Confirmation-email mutation is separate from the send-verification-email
                // mutation because otherwise it goes to the old email address (aka null)
                await updateCurrentUser({
                  whenConfirmationEmailSent: new Date(),
                });
              }
              setSubscriptionConfirmed(true);
            } catch(e) {
              if (getGraphQLErrorID(e) === "users.email_already_taken") {
                flash("That email address is already taken by a different account.");
              } else {
                flash(e.message || e.id);
              }
            }
            setLoading(false);
          } else {
            flash("Please enter a valid email address.");
          }
          captureEvent("subscribeReminderButtonClicked", {buttonType: "subscribeButton"});
        }}>Submit</Button>
        {adminUiMessage}
        <div className={classes.buttons}>
          {maybeLaterButton}
          {dontAskAgainButton}
        </div>
      </div>
    </AnalyticsWrapper>
  } else if (currentUser.unsubscribeFromAll || adminBranch===2) {
    // User has clicked unsubscribe-from-all at some point in the past. Pitch
    // on re-subscribing. A big Subscribe button, which clears the
    // unsubscribe-from-all option, activates curation emails (if not already
    // activated), and sends a confirmation email (if needed).
    const subscribeTextNode = forumTypeSetting.get() === 'EAForum' ? eaForumSubscribePrompt : (
      <div className={classes.message}>
        You previously unsubscribed from all emails from LessWrong.
        Re-subscribe to get the best posts emailed to you! {subscriptionDescription}
      </div>
    );
    return <AnalyticsWrapper branch="previously-unsubscribed">
      {subscribeTextNode}
      <Button className={classes.subscribeButton} onClick={async (ev) => {
        await updateAndMaybeVerifyEmail();
        captureEvent("subscribeReminderButtonClicked", {buttonType: "subscribeButton"});
      }}>Subscribe</Button>
      {adminUiMessage}
      <div className={classes.buttons}>
        {maybeLaterButton}
        {dontAskAgainButton}
      </div>
    </AnalyticsWrapper>
  } else if (!currentUserSubscribed || adminBranch===3) {
    // User is logged in, and has an email address associated with their
    // account, but is not subscribed to curated posts. A Subscribe button which
    // sets the subscribe-to-curated option, and (if their email address isn't
    // verified) resends the verification email.
    const subscribeTextNode = forumTypeSetting.get() === 'EAForum' ? eaForumSubscribePrompt : (
      <div className={classes.message}>
        Subscribe to get the best of LessWrong emailed to you. {subscriptionDescription}
      </div>
    );
    return <AnalyticsWrapper branch="logged-in-not-subscribed">
      {subscribeTextNode}
      <Button className={classes.subscribeButton} onClick={async (ev) => {
        await updateAndMaybeVerifyEmail();
        captureEvent("subscribeReminderButtonClicked", {buttonType: "subscribeButton"});
      }}>Subscribe</Button>
      {adminUiMessage}
      <div className={classes.buttons}>
        {maybeLaterButton}
        {dontAskAgainButton}
      </div>
    </AnalyticsWrapper>
  } else if (!userEmailAddressIsVerified(currentUser) || adminBranch===4) {
    // User is subscribed, but they haven't verified their email address. Show
    // a resend-verification-email button.
    return <AnalyticsWrapper branch="needs-email-verification">
      <div>
        <div className={classes.message}>
          Please verify your email address to activate your subscription to curated posts.
        </div>
        <div className={classes.buttons}>
          <Button className={classes.subscribeButton} onClick={async (ev) => {
            setLoading(true);
            try {
              await updateCurrentUser({
                whenConfirmationEmailSent: new Date()
              });
            } catch(e) {
              flash(getGraphQLErrorMessage(e));
            }
            setLoading(false);
            setVerificationEmailSent(true);
            captureEvent("subscribeReminderButtonClicked", {buttonType: "resendVerificationEmailButton"});
          }}>Resend Verification Email</Button>
          {adminUiMessage}
          <div className={classes.buttons}>
            {maybeLaterButton}
            {dontAskAgainButton}
          </div>
        </div>
      </div>
    </AnalyticsWrapper>
  } else {
    // Everything looks good-already subscribed to curated. No need to show anything.
    return null;
  }
}

const RecentDiscussionSubscribeReminderComponent = registerComponent(
  'RecentDiscussionSubscribeReminder', RecentDiscussionSubscribeReminder, {
    styles,
    hocs: [withErrorBoundary],
  }
);

declare global {
  interface ComponentTypes {
    RecentDiscussionSubscribeReminder: typeof RecentDiscussionSubscribeReminderComponent,
  }
}
