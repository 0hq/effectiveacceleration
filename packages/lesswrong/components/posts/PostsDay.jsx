import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Components, registerComponent } from 'meteor/vulcan:core';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit*3
  },
  dayTitle: {
    marginBottom: theme.spacing.unit*2,
    whiteSpace: "pre",
    textOverflow: "ellipsis",
    ...theme.typography.postStyle,
    fontWeight: 600
  },
  noPosts: {
    marginLeft: "23px",
    color: "rgba(0,0,0,0.5)",
  },
})

class PostsDay extends PureComponent {

  render() {
    const { date, posts, classes, currentUser } = this.props;
    const noPosts = posts.length === 0;
    const { PostsItem2 } = Components

    return (
      <div className={classNames("posts-day", classes.root)}>
        <Typography variant="body2" className={classes.dayTitle}>
          <Hidden xsDown implementation="css">
            {date.format('dddd, MMMM Do YYYY')}
          </Hidden>
          <Hidden smUp implementation="css">
            {date.format('ddd, MMM Do YYYY')}
          </Hidden>
        </Typography>
        { noPosts ? (<div className={classes.noPosts}>No posts on {date.format('MMMM Do YYYY')}</div>) :
          <div className="posts-list">
            <div className="posts-list-content">
              {posts.map((post, index) => <PostsItem2 key={post._id} post={post} currentUser={currentUser}/>)}
            </div>
          </div>
        }
      </div>
    );
  }
}

PostsDay.propTypes = {
  currentUser: PropTypes.object,
  date: PropTypes.object,
  number: PropTypes.number
};

registerComponent('PostsDay', PostsDay, withStyles(styles, { name: "PostsDay" }));
