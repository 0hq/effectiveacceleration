import { registerComponent, Components } from 'meteor/vulcan:core';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  lengthLimited: {
    maxWidth: 300,
    textOverflow: "ellipsis",
    overflowX: "hidden",
    whiteSpace: "nowrap"
  },
  lengthUnlimited: {
    display: "inline",
  },
});

const PostsUserAndCoauthors = ({post, abbreviateIfLong=false, classes}) => {
  if (!post.user || post.hideAuthor)
    return '[deleted]';
  
  return <div className={abbreviateIfLong ? classes.lengthLimited : classes.lengthUnlimited}>
    {<Components.UsersName user={post.user} />}
    {post.coauthors.map(coauthor =>
      <React.Fragment key={coauthor._id}>, <Components.UsersName user={coauthor} /></React.Fragment>)}
  </div>;
};

PostsUserAndCoauthors.propTypes = {
  post: PropTypes.object,
  abbreviateIfLong: PropTypes.bool,
};

registerComponent("PostsUserAndCoauthors", PostsUserAndCoauthors, withStyles(styles, {name: "PostsUserAndCoauthors"}));