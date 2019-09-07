import { registerComponent, Components } from 'meteor/vulcan:core';
import React from 'react';
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames';
import withUser from "../common/withUser";
import { useLocation } from '../../lib/routeUtil';

const styles = theme => ({
  root: {
    color: "rgba(0,0,0,.87)",
    position: "relative",
    lineHeight: "2.0rem",
    zIndex: theme.zIndexes.postItemTitle,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 2,
    },
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    alignItems: "center",
    fontSize: "1.3rem",
    [theme.breakpoints.down('sm')]: {
      whiteSpace: "unset",
      lineHeight: "1.8rem",
    },
    fontFamily: theme.typography.postStyle.fontFamily,
    marginRight: theme.spacing.unit,
  },
  wrap: {
    whiteSpace: "normal",
  },
  expandOnHover: {
    [theme.breakpoints.up('md')]: {
      '&:hover': {
        overflow: "visible",
        textOverflow: "unset",
        position: "absolute",
        background: "#efefef",
        borderImage: "linear-gradient(to right, #efefef, rgba(255,255,255,0)) 1 100%",
        borderRightWidth: 20,
        borderRightStyle: "solid",
        backgroundClip: "padding-box",
        borderLeft: 0,
        borderTop: 0,
        borderBottom: 0,
      }
    }
  },
  sticky: {
    paddingRight: theme.spacing.unit,
    position: "relative",
    top: 2
  },
  read: {
    opacity: .6,
    textShadow: "none",
    '&:hover': {
      opacity: 1
    }
  },
  hideSmDown: {
    [theme.breakpoints.down('sm')]: {
      display: "none",
    }
  },
  tag: {
    marginRight: theme.spacing.unit
  },
  popper: {
    opacity: 1, // this is because Tooltip has a default opacity less than 1
  },
  tooltip: {
    position: "relative",
    left: -50,
    top: -27,
    background: "none",
  }
})

const stickyIcon = <svg fill="#000000" height="15" viewBox="0 0 10 15" width="10" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0h24v24H0z" fill="none"/>
    <path id="path0_fill" d="M 0.62965 7.43734C 0.504915 7.43692 0.383097 7.40021 0.279548 7.33183C 0.175999 7.26345 0.0953529 7.16646 0.0477722 7.05309C 0.000191541 6.93972 -0.0121941 6.81504 0.0121763 6.69475C 0.0365467 6.57447 0.0965826 6.46397 0.184718 6.37719L 1.77312 4.81248L 1.77312 1.75013L 1.32819 1.75013C 1.20359 1.75073 1.08025 1.72558 0.966163 1.67633C 0.852072 1.62708 0.749771 1.55483 0.665885 1.46423C 0.581999 1.37364 0.518398 1.26674 0.479198 1.15045C 0.439999 1.03415 0.426075 0.91106 0.438329 0.789139C 0.466198 0.56792 0.576593 0.364748 0.748122 0.218993C 0.919651 0.0732386 1.1401 -0.00472087 1.36675 0.000221379L 8.00217 0.000221379C 8.12677 -0.000372526 8.25011 0.0247692 8.3642 0.0740189C 8.47829 0.123269 8.58059 0.195528 8.66448 0.286119C 8.74837 0.37671 8.81197 0.483614 8.85117 0.599907C 8.89037 0.716201 8.90429 0.839293 8.89204 0.961214C 8.86417 1.18243 8.75377 1.38561 8.58224 1.53136C 8.41071 1.67711 8.19026 1.75507 7.96361 1.75013L 7.55724 1.75013L 7.55724 4.81248L 9.14861 6.37719C 9.23675 6.46397 9.29679 6.57447 9.32116 6.69475C 9.34553 6.81504 9.33314 6.93972 9.28556 7.05309C 9.23798 7.16646 9.15733 7.26345 9.05378 7.33183C 8.95023 7.40021 8.82842 7.43692 8.70368 7.43734L 0.62965 7.43734ZM 4.16834 13.562C 4.18174 13.6824 4.23985 13.7937 4.33154 13.8745C 4.42323 13.9553 4.54204 14 4.66518 14C 4.78833 14 4.90713 13.9553 4.99882 13.8745C 5.09051 13.7937 5.14863 13.6824 5.16202 13.562L 5.73747 8.74977L 3.5929 8.74977L 4.16834 13.562Z"/>
</svg>

const PostsTitle = ({currentUser, post, classes, sticky, read, expandOnHover, tooltip=true, showQuestionTag=true, wrap=false}) => {
  const { pathname } = useLocation();
  const { PostsItemIcons } = Components

  const shared = post.draft && (post.userId !== currentUser._id)

  const shouldRenderQuestionTag = (pathname !== "/questions") && showQuestionTag
  const shouldRenderEventsTag = pathname !== "/community"

  return <span className={classNames(
    classes.root,
    {
      [classes.read]: read,
      [classes.expandOnHover]: expandOnHover,
      [classes.wrap]: wrap
    }
  )}>
    {post.unlisted && <span className={classes.tag}>[Unlisted]</span>}

    {sticky && <span className={classes.sticky}>{stickyIcon}</span>}

    {shared && <span className={classes.tag}>[Shared]</span>}

    {post.question && shouldRenderQuestionTag && <span className={classes.tag}>[Question]</span>}

    {post.url && <span className={classes.tag}>[Link]</span>}

    {post.isEvent && shouldRenderEventsTag && <span className={classes.tag}>[Event]</span>}

    <span>{post.title}</span>

    <span className={classes.hideSmDown}>
      <PostsItemIcons post={post}/>
    </span>
  </span>
}

registerComponent('PostsTitle', PostsTitle, withUser,
  withStyles(styles, { name: "PostsTitle" })
);
