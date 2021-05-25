import React from 'react';
import { registerComponent, Components } from '../../../lib/vulcan-lib';
import { useUpdate } from '../../../lib/crud/withUpdate';
import { useMessages } from '../../common/withMessages';
import MenuItem from '@material-ui/core/MenuItem';
import { useApolloClient } from '@apollo/client/react/hooks';
import { useCurrentUser } from '../../common/withUser';
import { userCanDo } from '../../../lib/vulcan-users/permissions';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt';
import Undo from '@material-ui/icons/Undo';

const styles = (theme: ThemeType): JssStyles => ({
  iconRoot: {
    position: "relative",
    width:24,
  },
  omegaIcon: {
    position:"absolute !important",
    left:0,
    top: "7px !important",
    opacity:.3
  },
  moveIcon: {
    marginLeft:8,
    color: "black"
  },
  undoIcon: {
    marginLeft:8,
    width: 20,
    color: "black"
  }
})

const MoveToAlignmentMenuItem = ({comment, post, classes}: {
  comment: CommentsList,
  post: PostsBase,
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const client = useApolloClient();
  const {flash} = useMessages();
  const {mutate: updateComment} = useUpdate({
    collectionName: "Comments",
    fragmentName: 'CommentsList',
  });
  
  const handleMoveToAlignmentForum = async () => {
    if (!currentUser) return;
    await updateComment({
      selector: { _id: comment._id},
      data: {
        af: true,
        afDate: new Date(),
        moveToAlignmentUserId: currentUser._id
      },
    })
    await client.resetStore()
    flash("Comment and its parents moved to AI Alignment Forum")
  }

  const handleRemoveFromAlignmentForum = async () => {
    await updateComment({
      selector: { _id: comment._id},
      data: {
        af: false,
        afDate: null,
        moveToAlignmentUserId: null
      },
    })

    await client.resetStore()
    flash("Comment and its children removed from AI Alignment Forum")
  }

  const render = () => {
    const { OmegaIcon } = Components
    if (post.af && userCanDo(currentUser, 'comments.alignment.move.all')) {
      if (!comment.af) {
        return (
          <MenuItem onClick={handleMoveToAlignmentForum}>
            <ListItemIcon>
              <span className={classes.iconRoot}>
                <OmegaIcon className={classes.omegaIcon}/>
                <ArrowRightAlt className={classes.moveIcon}/>
              </span>
            </ListItemIcon>
            Move to Alignment
          </MenuItem>
        )
      } else {
        return (
          <MenuItem onClick={handleRemoveFromAlignmentForum}>
            <ListItemIcon>
              <span className={classes.iconRoot}>
                <OmegaIcon className={classes.omegaIcon} />
                <Undo className={classes.undoIcon}/>
              </span>
            </ListItemIcon>
            Remove from Alignment
          </MenuItem>
        )
      }
    } else  {
      return null
    }
  }
  return render();
}

const MoveToAlignmentMenuItemComponent = registerComponent(
  'MoveToAlignmentMenuItem', MoveToAlignmentMenuItem, {styles}
);

declare global {
  interface ComponentTypes {
    MoveToAlignmentMenuItem: typeof MoveToAlignmentMenuItemComponent
  }
}
