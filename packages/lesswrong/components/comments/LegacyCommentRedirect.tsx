import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useLocation } from '../../lib/routeUtil';
import { usePostByLegacyId } from '../posts/usePost';
import { useCommentByLegacyId } from './useComment';
import { Comments } from '../../lib/collections/comments/collection';
import { Posts } from '../../lib/collections/posts/collection';


const LegacyCommentRedirect = () => {
  const { params } = useLocation();
  const legacyPostId = params.id;
  const legacyCommentId = params.commentId;
  const { post, loading: loadingPost } = usePostByLegacyId({ legacyId: legacyPostId });
  const { comment, loading: loadingComment } = useCommentByLegacyId({ legacyId: legacyCommentId });
  
  if (post && comment) {
    const canonicalUrl = Comments.getPageUrlFromIds({
      postId: post._id, postSlug: post.slug,
      commentId: comment._id, permalink: true
    });
    return <Components.PermanentRedirect url={canonicalUrl}/>
  } else if (post) {
    const canonicalUrl = Posts.getPageUrl(post);
    return <Components.PermanentRedirect url={canonicalUrl}/>
  } else {
    return (loadingPost || loadingComment) ? <Components.Loading/> : <Components.Error404/>;
  }
};

const LegacyCommentRedirectComponent = registerComponent('LegacyCommentRedirect', LegacyCommentRedirect);

declare global {
  interface ComponentTypes {
    LegacyCommentRedirect: typeof LegacyCommentRedirectComponent,
  }
}

