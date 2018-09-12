import { Components, registerComponent } from 'meteor/vulcan:core';
import { Posts } from 'meteor/example-forum';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { postHighlightStyles } from '../../themes/stylePiping'
import { Link } from 'react-router';

const styles = theme => ({
  root: {
    maxWidth:570,
    ...postHighlightStyles(theme),
  },
  highlightContinue: {
    marginTop:theme.spacing.unit*2
  }
})

const PostsHighlight = ({post, classes}) => {
  if (post) {
    return <div className={classes.root}>
      <Components.LinkPostMessage post={post} />
      <div dangerouslySetInnerHTML={{__html: post.htmlHighlight}}/>
      <div className={classes.highlightContinue}>
        {post.wordCount > 280 && <Link to={Posts.getPageUrl(post)}>
          (Continue Reading{` – ${post.wordCount - 280} more words`})
        </Link>}
      </div>
    </div>
  } else {
    return null
  }
};

PostsHighlight.displayName = "PostsHighlight";

registerComponent('PostsHighlight', PostsHighlight, withStyles(styles, {name:"PostsHighlight"}));
