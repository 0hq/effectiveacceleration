import { registerComponent, Components } from 'meteor/vulcan:core';
import React from 'react';
import { withStyles } from '@material-ui/core/styles'
import { truncate } from '../../lib/editor/ellipsize';
import withUser from "../common/withUser";
import { withRouter } from '../../lib/reactRouterWrapper.js';

const styles = theme => ({
  tooltip:{
    position: "relative",
    left: -30,
  },
  root: {
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit,
    },
  },
  tooltipInfo: {
    fontStyle: "italic"
  },
  tooltipTitle: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit*1.5,
    fontWeight: 600,
    fontSize: "1.2rem",
    [theme.breakpoints.down('sm')]: {
      display: "none"
    },
  },
  highlight: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit*2,
    fontSize: "1.1rem",
    [theme.breakpoints.down('sm')]: {
      display: "none"
    },
    '& img': {
      display:"none"
    },
    '& h1': {
      fontSize: "1.2rem"
    },
    '& h2': {
      fontSize: "1.2rem"
    },
    '& h3': {
      fontSize: "1.1rem"
    },
    '& hr': {
      display: "none"
    },
  },
})

const getPostCategory = (post) => {
  const postOrQuestion = post.question ? "Question" : "Post"

  if (post.af) return `Alignment Forum ${postOrQuestion}`
  if (post.meta) return `Meta ${postOrQuestion}`
  if (post.curatedDate) return `Curated ${postOrQuestion}`
  if (post.frontpageDate) return `Frontpage ${postOrQuestion}`
  if (post.isEvent) return `Event`
  return post.question ? `Question` : `Personal Blogpost`
}

const PostsItemTooltip = ({ post, classes, author, }) => {
  const { PostsUserAndCoauthors } = Components
  const postCategory = getPostCategory(post)
  const { wordCount = 0, htmlHighlight = "" } = post.contents || {}

  const highlight = truncate(htmlHighlight, 600)

  return <div className={classes.root}>
    <div className={classes.tooltipInfo}>
      {postCategory}
      { author && post.user && <span> by <PostsUserAndCoauthors post={post}/></span>}
    </div>
    <div dangerouslySetInnerHTML={{__html:highlight}}
      className={classes.highlight} />
    {(wordCount > 0) && <div className={classes.tooltipInfo}>
      {wordCount} words (approx. {Math.ceil(wordCount/300)} min read)
    </div>}
  </div>

}

PostsItemTooltip.displayName = "PostsItemTooltip";

registerComponent('PostsItemTooltip', PostsItemTooltip, withUser, withRouter,
  withStyles(styles, { name: "PostsItemTooltip" })
);
