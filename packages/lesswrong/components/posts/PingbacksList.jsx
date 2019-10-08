import React from 'react';
import { registerComponent, useMulti, Components } from 'meteor/vulcan:core';
import { Posts } from '../../lib/collections/posts/collection.js';
import { useCurrentUser } from '../common/withUser';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
  root: {
    marginBottom: theme.spacing.unit*4
  },
  list: {
    marginTop: theme.spacing.unit
  },
  link: {
    ...theme.typography.postStyle,
    fontSize: "1.3rem",
    lineHeight: "1.8rem",
    marginTop: theme.spacing.unit/2,
    marginBottom: theme.spacing.unit/2,
    display: "flex",
    alignItems: "center",
  },
  karma: {
    width: 42,
    justifyContent: "center",
  }
});

const PingbacksList = ({classes, postId}) => {
  const { results, loading } = useMulti({
    terms: {
      view: "pingbackPosts",
      postId: postId,
    },
    collection: Posts,
    queryName: "pingbackPostList",
    fragmentName: "PostsList",
    limit: 5,
    enableTotal: false,
    ssr: true
  });
  const currentUser = useCurrentUser();

  const { SectionSubtitle, Pingback, Loading } = Components

  if (loading)
    return <Loading/>
  
  if (results) {
    if (results.length > 0) {
      return <div className={classes.root}>
        <SectionSubtitle>
          <Tooltip title="Posts that linked to this post" placement="right">
            <span>Pingbacks</span>
          </Tooltip>
        </SectionSubtitle>
        <div className={classes.list}>
          {results.map((post, i) => 
            <div key={post._id} >
              <Pingback post={post} currentUser={currentUser}/>
            </div>
          )}
        </div>
      </div>
    }
  }
  
  return null;
}

registerComponent("PingbacksList", PingbacksList, withStyles(styles, {name: "PingbacksList"}));
