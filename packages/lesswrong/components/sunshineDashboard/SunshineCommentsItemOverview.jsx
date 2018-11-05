import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import { Posts } from '../../lib/collections/posts';
import Users from 'meteor/vulcan:users';
import { Link } from 'react-router'
import Icon from '@material-ui/core/Icon';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import withUser from '../common/withUser';
import PropTypes from 'prop-types';

const styles = theme => ({
  comment: {
    fontSize: "1rem",
    lineHeight: "1.5em"
  }
})

class SunshineCommentsItemOverview extends Component {

  render () {
    const { comment, classes } = this.props
    let commentExcerpt = comment.body.substring(0,38);
    return (
      <div>
        <Typography variant="body2">
          <Link to={Posts.getPageUrl(comment.post) + "#" + comment._id} className={classes.comment}>
            { comment.deleted ? <span>COMMENT DELETED</span>
              : <span>{ commentExcerpt }</span>
            }
          </Link>
        </Typography>
        <div>
          <Components.SidebarInfo>
            { comment.baseScore }
          </Components.SidebarInfo>
          <Components.SidebarInfo>
            <Link to={Users.getProfileUrl(comment.user)}>
                {comment.user && comment.user.displayName}
            </Link>
          </Components.SidebarInfo>
          <Components.SidebarInfo>
            <Link to={Posts.getPageUrl(comment.post) + "#" + comment._id}>
              <Components.FromNowDate date={comment.postedAt}/>
              <Icon className={"material-icons comments-item-permalink"}> link </Icon>
            </Link>
          </Components.SidebarInfo>
        </div>
      </div>
    )
  }
}

SunshineCommentsItemOverview.propTypes = {
  comment: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
}

registerComponent('SunshineCommentsItemOverview', SunshineCommentsItemOverview, withUser, withStyles(styles, { name: "SunshineCommentsItemOverview"}));
