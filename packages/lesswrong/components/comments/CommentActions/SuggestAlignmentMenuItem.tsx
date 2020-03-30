import React from 'react';
import { registerComponent, Components } from '../../../lib/vulcan-lib';
import { useUpdate } from '../../../lib/crud/withUpdate';
import MenuItem from '@material-ui/core/MenuItem';
import { Comments } from '../../../lib/collections/comments'
import Users from '../../../lib/collections/users/collection';
import { useCurrentUser } from '../../common/withUser';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ExposurePlus1 from '@material-ui/icons/ExposurePlus1';
import Undo from '@material-ui/icons/Undo';

const styles = theme => ({
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
  plusOneIcon: {
    marginLeft:8,
    color: "black",
    width:20
  },
  undoIcon: {
    marginLeft:8,
    width: 20,
    color: "black"
  }
})

const SuggestAlignmentMenuItem = ({ comment, post, classes }: {
  comment: CommentsList,
  post: PostsDetails,
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const { mutate: updateComment } = useUpdate({
    collection: Comments,
    fragmentName: 'SuggestAlignmentComment',
  });
  const { OmegaIcon } = Components

  if (post.af && !comment.af && Users.canDo(currentUser, 'comments.alignment.suggest')) {

    const userHasSuggested = comment.suggestForAlignmentUserIds && comment.suggestForAlignmentUserIds.includes(currentUser!._id)

    if (!userHasSuggested) {
      return (
        <MenuItem onClick={() => Comments.suggestForAlignment({ currentUser, comment, updateComment })}>
          <ListItemIcon>
            <span className={classes.iconRoot}>
              <OmegaIcon className={classes.omegaIcon}/>
              <ExposurePlus1 className={classes.plusOneIcon}/>
            </span>
          </ListItemIcon>
          Suggest for Alignment
        </MenuItem>
      )
    } else {
      return <MenuItem onClick={() => Comments.unSuggestForAlignment({ currentUser, comment, updateComment })}>
        <ListItemIcon>
          <span className={classes.iconRoot}>
            <OmegaIcon className={classes.omegaIcon}/>
            <Undo className={classes.undoIcon}/>
          </span>
        </ListItemIcon>
          Unsuggest for Alignment
        </MenuItem>
    }
  } else {
    return null
  }
}

const SuggestAlignmentMenuItemComponent = registerComponent(
  'SuggestAlignmentMenuItem', SuggestAlignmentMenuItem, {styles}
);

declare global {
  interface ComponentTypes {
    SuggestAlignmentMenuItem: typeof SuggestAlignmentMenuItemComponent
  }
}

