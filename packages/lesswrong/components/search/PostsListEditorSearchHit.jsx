import React, { PureComponent } from 'react';
import { Components, registerComponent} from 'meteor/vulcan:core';
import { Posts } from '../../lib/collections/posts';
import { Link, withRouter } from 'react-router';

import { withStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';

const styles = theme => ({
    root: {
      padding: theme.spacing.unit,
      borderBottom: "solid 1px",
      borderBottomColor: grey[200],
      '&:hover': {
        backgroundColor: grey[100],
      }
    },
    postLink: {
      float:"right",
      marginRight: theme.spacing.unit
    }
  })

const PostsListEditorSearchHit = ({hit, clickAction, router, classes}) => {
  // If clickAction is provided, disable link and replace with Click of the action
  return (
    <div className={classes.root}>
      <Components.PostsItemTitle post={hit} />
      {hit.authorDisplayName && <Components.MetaInfo>
        {hit.authorDisplayName}
      </Components.MetaInfo>}
      <Components.MetaInfo>
        {hit.baseScore} points
      </Components.MetaInfo>
      {hit.postedAt && <Components.MetaInfo>
        <Components.FromNowDate date={hit.postedAt}/>
      </Components.MetaInfo>}
      <Link to={Posts.getLink(hit)} target={Posts.getLinkTarget(hit)} className={classes.postLink}>
        (Link)
      </Link>
    </div>
  )
}


registerComponent("PostsListEditorSearchHit", PostsListEditorSearchHit, withRouter, withStyles(styles, { name: "PostsListEditorSearchHit" }));
