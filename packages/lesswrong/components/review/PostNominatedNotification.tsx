import React from 'react';
import { useSingle } from '../../lib/crud/withSingle';
import { forumTitleSetting } from '../../lib/instanceSettings';
import { REVIEW_NAME_IN_SITU, REVIEW_YEAR } from '../../lib/reviewUtils';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { commentBodyStyles } from '../../themes/stylePiping';
import { POST_PREVIEW_WIDTH } from '../posts/PostsPreviewTooltip';
import { notificationLoadingStyles } from '../posts/PostsPreviewTooltipSingle';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit*1.5,
    width: POST_PREVIEW_WIDTH,
  },
  text: {
    ...commentBodyStyles(theme),
  },
  loading: {
    ...notificationLoadingStyles(theme)
  },
  reviewButton: {
    padding: theme.spacing.unit,
    textAlign: "center"
  }
})

const PostNominatedNotification = ({classes, postId}:{classes:ClassesType, postId:string}) => {

  const { Loading, PostsTitle, ReviewPostButton, LWTooltip } = Components

  const { document: post, loading } = useSingle({
    collectionName: "Posts",
    fragmentName: 'PostsList',
    fetchPolicy: 'cache-then-network' as any, //TODO
    documentId: postId
  });

  if (loading) return <div className={classes.loading}>
    <Loading/>
  </div>

  if (!post) return <div className={classes.root}>Error</div>

  return <div className={classes.root}>
    <PostsTitle post={post}/>
    <div className={classes.text}>
      <p>Your post has been nominated for the {REVIEW_NAME_IN_SITU}. You're encouraged to write a self-review, exploring how you think about the post today. Do you still endorse it? Have you learned anything new that adds more depth? How might you improve the post?</p>
      <div className={classes.reviewButton}>
        <ReviewPostButton post={post} year={REVIEW_YEAR+""} reviewMessage={<LWTooltip title={`Write up your thoughts on what was good about a post, how it could be improved, and how you think stands the tests of time as part of the broader ${forumTitleSetting.get()} conversation`} placement="bottom">
            <div className={classes.reviewButton}>Write a Review</div>
          </LWTooltip>}/>
      </div>
    </div>
  </div>
}

const PostNominatedNotificationComponent = registerComponent('PostNominatedNotification', PostNominatedNotification, {styles});

declare global {
  interface ComponentTypes {
    PostNominatedNotification: typeof PostNominatedNotificationComponent
  }
}
