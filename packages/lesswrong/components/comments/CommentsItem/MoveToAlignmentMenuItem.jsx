import React, { PureComponent } from 'react';
import { registerComponent, withMessages, withUpdate, Components } from 'meteor/vulcan:core';
import MenuItem from '@material-ui/core/MenuItem';
import { withApollo } from 'react-apollo'
import { Comments } from "../../../lib/collections/comments";
import withUser from '../../common/withUser';
import Users from 'meteor/vulcan:users';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt';
import Undo from '@material-ui/icons/Undo';
import { withStyles } from '@material-ui/core/styles'

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

class MoveToAlignmentMenuItem extends PureComponent {

  handleMoveToAlignmentForum = async () => {
    const { comment, updateComment, client, flash, currentUser, } = this.props
    await updateComment({
      selector: { _id: comment._id},
      data: {
        af: true,
        afDate: new Date(),
        moveToAlignmentUserId: currentUser._id
      },
    })
    client.resetStore()
    flash({id:"alignment.move_comment"})
  }

  handleRemoveFromAlignmentForum = async () => {
    const { comment, updateComment, client, flash } = this.props

    await updateComment({
      selector: { _id: comment._id},
      data: {
        af: false,
        afDate: null,
        moveToAlignmentUserId: null
      },
    })

    client.resetStore()
    flash({id:"alignment.remove_comment"})
  }

  render() {
    const { comment, post, currentUser, classes } = this.props
    const { OmegaIcon } = Components
    if (post.af && Users.canDo(currentUser, 'comments.alignment.move.all')) {
      if (!comment.af) {
        return (
          <MenuItem onClick={ this.handleMoveToAlignmentForum}>
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
          <MenuItem onClick={ this.handleRemoveFromAlignmentForum }>
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
}

const withUpdateOptions = {
  collection: Comments,
  fragmentName: 'CommentsList',
}

registerComponent(
  'MoveToAlignmentMenuItem',
   MoveToAlignmentMenuItem,
   [withUpdate, withUpdateOptions],
   withStyles(styles, {name:'MoveToAlignmentMenuItem'}),
   withMessages,
   withApollo,
   withUser
);
export default MoveToAlignmentMenuItem;
