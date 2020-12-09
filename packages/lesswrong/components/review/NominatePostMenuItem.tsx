import React from 'react';
import { registerComponent } from '../../lib/vulcan-lib';
import { useMulti } from '../../lib/crud/withMulti';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';

import { useDialog } from '../common/withDialog';
import { useCurrentUser } from '../common/withUser';
import { postGetPageUrl } from "../../lib/collections/posts/helpers";
import { useNavigation } from '../../lib/routeUtil';
import qs from 'qs'

export function eligibleToNominate (currentUser) {
  if (!currentUser) return false;
  if (new Date(currentUser.createdAt) > new Date("2019-01-01")) return false
  return true
}

const NominatePostMenuItem = ({ post, closeMenu }: {
  post: PostsBase,
  closeMenu: ()=>void,
}) => {
  const currentUser = useCurrentUser();
  const { openDialog } = useDialog();
  const { history } = useNavigation();

  const { results: nominations = [], loading } = useMulti({
    skip: !currentUser,
    terms: {
      view:"nominations2019",
      postId: post._id, 
      userId: currentUser?._id
    },
    collectionName: "Comments",
    fragmentName: "CommentsList"
  });

  if (!eligibleToNominate(currentUser)) return null
  if (post.userId === currentUser!._id) return null
  if (new Date(post.postedAt) > new Date("2020-01-01")) return null
  if (new Date(post.postedAt) < new Date("2019-01-01")) return null

  const nominated = !loading && nominations?.length;

  const tooltip = nominated ?
      <div>
        <div>You have already nominated this post. </div>
        <div><em>(Click to review or edit your endorsement)</em></div>
      </div>
    :
    "Write an endorsement for the 2019 Review."

  const handleClick = () => {
    if (nominated) {
      history.push({pathname: postGetPageUrl(post), search: `?${qs.stringify({commentId: nominations[0]._id})}`});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      closeMenu();
      openDialog({
        componentName:"NominatePostDialog",
        componentProps: {post}
      })
    }
  }
  
  return (<React.Fragment>
      <Tooltip title={tooltip} placement="left">
        <MenuItem onClick={handleClick}>
          <ListItemIcon>
            { nominated ? <StarIcon /> : <StarBorderIcon /> }
          </ListItemIcon>
          {nominated ? "View Nomination" : "Nominate Post"}
        </MenuItem>
      </Tooltip>
      <Divider/>
    </React.Fragment>
  );
}

const NominatePostMenuItemComponent = registerComponent('NominatePostMenuItem', NominatePostMenuItem);

declare global {
  interface ComponentTypes {
    NominatePostMenuItem: typeof NominatePostMenuItemComponent
  }
}

