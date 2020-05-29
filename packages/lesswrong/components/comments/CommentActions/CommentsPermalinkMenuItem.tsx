import React from 'react';
import { registerComponent } from '../../../lib/vulcan-lib';
import MenuItem from '@material-ui/core/MenuItem';
import LinkIcon from '@material-ui/icons/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { Link } from '../../../lib/reactRouterWrapper';
import { Comments } from "../../../lib/collections/comments";

const CommentsPermalinkMenuItem = ({comment, post}: {
  comment: HasIdType,
  post: PostsBase,
}) => {
  return <Link to={Comments.getPageUrlFromIds({postId: post._id, postSlug: post.slug, commentId: comment._id})}>
    <MenuItem>
      <ListItemIcon>
        <LinkIcon />
      </ListItemIcon>
      Go to Permalink
    </MenuItem>
  </Link>
}

const CommentsPermalinkMenuItemComponent = registerComponent('CommentsPermalinkMenuItem', CommentsPermalinkMenuItem);

declare global {
  interface ComponentTypes {
    CommentsPermalinkMenuItem: typeof CommentsPermalinkMenuItemComponent,
  }
}

