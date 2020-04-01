import { registerComponent, getSetting } from '../../lib/vulcan-lib';
import React from 'react';

const styles = theme => ({
  root: {
    ...theme.typography.contentNotice,
    ...theme.typography.postStyle
  },
})

const AlignmentCrosspostMessage = ({post, classes}: {
  post: PostsBase,
  classes: ClassesType,
}) => {
  if (post.af && getSetting('forumType') !== 'AlignmentForum') {
    return (
      <div className={classes.root}>
        Crossposted from the <a href={`https://alignmentforum.org/posts/${post._id}/${post.slug}`}>AI Alignment Forum</a>. May contain more technical jargon than usual.
      </div>
    );
  } else {
    return null
  }
}

const AlignmentCrosspostMessageComponent = registerComponent('AlignmentCrosspostMessage', AlignmentCrosspostMessage, {styles});

declare global {
  interface ComponentTypes {
    AlignmentCrosspostMessage: typeof AlignmentCrosspostMessageComponent
  }
}
