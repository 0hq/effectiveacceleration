import { registerComponent, Components } from '../../lib/vulcan-lib';
import React from 'react';
import SubdirectoryArrowLeft from '@material-ui/icons/SubdirectoryArrowLeft';
import classNames from 'classnames';
import { legacyBreakpoints } from '../../lib/utils/theme';

const styles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    cursor: "pointer",
    color: "rgba(0,0,0,.75)",
  },
  active: {
    color: "rgba(0,0,0, .3)",
  },
  icon: {
    fontSize: 12,
    transform: "rotate(90deg)"
  },
  parentComment: {
    background: "white",
    position: "absolute",
    zIndex: 2,
    maxWidth: 650,
    bottom: "100%",
    left: 0,
    boxShadow: "0 0 10px rgba(0,0,0,.2)"
  },
  usernameSpacing: {
    paddingRight: 1,
    color: "rgba(0,0,0,.3)",
    [legacyBreakpoints.maxSmall]: {
      padding: "0 10px",
    }
  },
  activeArrow: {
    transform: "rotate(-90deg)"
  }
})

const ShowParentComment = ({ comment, active, onClick, classes }: {
  comment: CommentsList,
  active?: boolean,
  onClick?: any,
  classes: ClassesType,
}) => {

  if (!comment) return null;
  
  return (
    <Components.LWTooltip title={`${active ? "Hide" : "Show"} previous comment`}>
      <span className={classNames(classes.root, {[classes.active]: active})} onClick={onClick}>
        <SubdirectoryArrowLeft className={classNames(classes.icon, {[classes.activeArrow]: active})}>
          subdirectory_arrow_left
        </SubdirectoryArrowLeft>
      </span>
    </Components.LWTooltip>
  )
};

const ShowParentCommentComponent = registerComponent('ShowParentComment', ShowParentComment, {styles});

declare global {
  interface ComponentTypes {
    ShowParentComment: typeof ShowParentCommentComponent,
  }
}

