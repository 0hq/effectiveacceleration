import { Components, registerComponent, getFragment, getSetting } from '../../lib/vulcan-lib';
import React, { useState } from 'react';
import { Comments } from '../../lib/collections/comments';
import { FormattedMessage } from '../../lib/vulcan-i18n';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';
import { useCurrentUser } from '../common/withUser'
import withErrorBoundary from '../common/withErrorBoundary'
import { useDialog } from '../common/withDialog';

const styles = theme => ({
  root: {
  },
  form: {
    padding: 10,
  },
  modNote: {
    paddingTop: '4px',
    color: theme.palette.grey[800]
  },
  submit: {
    textAlign: 'right'
  },
  formButton: {
    paddingBottom: "2px",
    fontSize: "16px",
    marginLeft: "5px",
    "&:hover": {
      opacity: .5,
      background: "none"
    },
    color: theme.palette.lwTertiary.main
  },
  cancelButton: {
    color: theme.palette.grey[400]
  },
  moderationGuidelinesWrapper: {
    backgroundColor: "rgba(0,0,0,.07)",
  }
});

const CommentsNewForm = ({prefilledProps = {}, post, parentComment, successCallback, type, cancelCallback, classes, removeFields, fragment = "CommentsList", formProps, enableGuidelines=true, padding=true}:
{
  prefilledProps?: any,
  post?: PostsMinimumInfo,
  parentComment?: any,
  successCallback?: any,
  type: string,
  cancelCallback?: any,
  classes: ClassesType,
  removeFields?: any,
  fragment?: string,
  formProps?: any,
  enableGuidelines?: boolean,
  padding?: boolean
}) => {
  const currentUser = useCurrentUser();
  prefilledProps = {
    ...prefilledProps,
    af: Comments.defaultToAlignment(currentUser, post, parentComment),
  };
  
  const [showGuidelines, setShowGuidelines] = useState(false)
  
  const { ModerationGuidelinesBox, WrappedSmartForm } = Components
  
  if (post) {
    prefilledProps = {
      ...prefilledProps,
      postId: post._id
    };
  }

  if (parentComment) {
    prefilledProps = {
      ...prefilledProps,
      parentCommentId: parentComment._id,
    };
  }

  const SubmitComponent = ({submitLabel = "Submit"}) => {
    const { openDialog } = useDialog();
    return <div className={classes.submit}>
      {(type === "reply") && <Button
        onClick={cancelCallback}
        className={classNames(classes.formButton, classes.cancelButton)}
      >
        Cancel
      </Button>}
      <Button
        type="submit"
        className={classNames(classes.formButton)}
        onClick={(ev) => {
          if (!currentUser) {
            openDialog({
              componentName: "LoginPopup",
              componentProps: {}
            });
            ev.preventDefault();
          }
        }}
      >
        {submitLabel}
      </Button>
    </div>
  };

  if (currentUser && !Comments.options.mutations.new.check(currentUser, prefilledProps)) {
    return <FormattedMessage id="users.cannot_comment"/>;
  }

  const commentWillBeHidden = getSetting('hideUnreviewedAuthorComments') && currentUser && !currentUser.isReviewed
  return (
    <div className={classes.root} onFocus={()=>setShowGuidelines(true)}>
      <div className={padding ? classes.form : null}>
      {commentWillBeHidden && <div className={classes.modNote}><em>
        A moderator will need to review your account before your comments will show up.
      </em></div>}

      <WrappedSmartForm
        collection={Comments}
        mutationFragment={getFragment(fragment)}
        successCallback={successCallback}
        cancelCallback={cancelCallback}
        prefilledProps={prefilledProps}
        layout="elementOnly"
        formComponents={{
          FormSubmit: SubmitComponent,
          FormGroupLayout: Components.DefaultStyleFormGroup
        }}
        alignmentForumPost={post?.af}
        addFields={currentUser?[]:["contents"]}
        removeFields={removeFields}
        formProps={formProps}
      />
      </div>
      {post && enableGuidelines && showGuidelines && <div className={classes.moderationGuidelinesWrapper}>
        <ModerationGuidelinesBox post={post} />
      </div>}
    </div>
  );
};

const CommentsNewFormComponent = registerComponent('CommentsNewForm', CommentsNewForm, {
  styles,
  hocs: [withErrorBoundary]
});

declare global {
  interface ComponentTypes {
    CommentsNewForm: typeof CommentsNewFormComponent,
  }
}

