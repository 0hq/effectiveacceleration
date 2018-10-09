import { Components, registerComponent, withList } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import { Posts } from '../../lib/collections/posts';
import Users from 'meteor/vulcan:users';
import { withStyles } from '@material-ui/core/styles';
import withUser from '../common/withUser';
import PropTypes from 'prop-types';

const styles = theme => ({
  root: {
    backgroundColor:"rgba(0,80,0,.08)"
  }
})

class SunshineNewPostsList extends Component {
  render () {
    const { results, classes } = this.props
    if (results && results.length && Users.canDo(this.props.currentUser, "posts.moderate.all")) {
      return (
        <div className={classes.root}>
          <Components.SunshineListTitle>
            Unreviewed Posts
          </Components.SunshineListTitle>
          {this.props.results.map(post =>
            <div key={post._id} >
              <Components.SunshineNewPostsItem post={post}/>
            </div>
          )}
        </div>
      )
    } else {
      return null
    }
  }
}

SunshineNewPostsList.propTypes = {
  results: PropTypes.array,
  classes: PropTypes.object.isRequired
};

const withListOptions = {
  collection: Posts,
  queryName: 'sunshineNewPostsListQuery',
  fragmentName: 'PostsList',
};

registerComponent('SunshineNewPostsList', SunshineNewPostsList, [withList, withListOptions], withUser, withStyles(styles, {name:"SunshineNewPostsList"}));
