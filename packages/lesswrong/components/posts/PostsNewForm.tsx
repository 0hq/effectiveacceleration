import { Components, registerComponent, getFragment, getSetting } from '../../lib/vulcan-lib';
import { useMessages } from '../common/withMessages';
import { Posts } from '../../lib/collections/posts';
import React from 'react';
import { useCurrentUser } from '../common/withUser'
import { useLocation, useNavigation } from '../../lib/routeUtil';
import NoSsr from '@material-ui/core/NoSsr';

const styles = theme => ({
  formSubmit: {
    display: "flex",
    flexWrap: "wrap",
  }
})

const PostsNewForm = ({classes}: {
  classes: ClassesType,
}) => {
  const { query } = useLocation();
  const { history } = useNavigation();
  const currentUser = useCurrentUser();
  const { flash } = useMessages();
  
  const { PostSubmit, WrappedSmartForm, WrappedLoginForm, SubmitToFrontpageCheckbox } = Components
  const userHasModerationGuidelines = currentUser && currentUser.moderationGuidelines && currentUser.moderationGuidelines.originalContents
  const af = getSetting('forumType') === 'AlignmentForum'
  const prefilledProps = {
    isEvent: query && !!query.eventForm,
    types: query && query.ssc ? ['SSC'] : [],
    meta: query && !!query.meta,
    af: af || (query && !!query.af),
    groupId: query && query.groupId,
    moderationStyle: currentUser && currentUser.moderationStyle,
    moderationGuidelines: userHasModerationGuidelines ? currentUser!.moderationGuidelines : undefined
  }
  const eventForm = query && query.eventForm

  if (!Posts.options.mutations.new.check(currentUser)) {
    return (<WrappedLoginForm />);
  }
  const NewPostsSubmit = (props) => {
    return <div className={classes.formSubmit}>
      {!eventForm && <SubmitToFrontpageCheckbox {...props} />}
      <PostSubmit {...props} />
    </div>
  }

  return (
    <div className="posts-new-form">
      <NoSsr>
        <WrappedSmartForm
          collection={Posts}
          mutationFragment={getFragment('PostsPage')}
          prefilledProps={prefilledProps}
          successCallback={post => {
            history.push({pathname: Posts.getPageUrl(post)});
            flash({ id: 'posts.created_message', properties: { title: post.title }, type: 'success'});
          }}
          eventForm={eventForm}
          repeatErrors
          formComponents={{
            FormSubmit: NewPostsSubmit,
          }}
        />
      </NoSsr>
    </div>
  );
}

const PostsNewFormComponent = registerComponent('PostsNewForm', PostsNewForm, {styles});

declare global {
  interface ComponentTypes {
    PostsNewForm: typeof PostsNewFormComponent
  }
}

