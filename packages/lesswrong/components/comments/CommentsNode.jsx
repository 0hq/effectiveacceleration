import { Components, replaceComponent } from 'meteor/vulcan:core';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import muiThemeable from 'material-ui/styles/muiThemeable';

const KARMA_COLLAPSE_THRESHOLD = -4;

class CommentsNode extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      collapsed: props && props.comment && props.comment.baseScore < KARMA_COLLAPSE_THRESHOLD
    };
  }

  toggleCollapse = () => {
    this.setState({collapsed: !this.state.collapsed});
  }

  toggleHover = () => {
    this.setState({hover: !this.state.hover});
  }

  render() {
    const {comment, currentUser, newComment, editMutation, muiTheme} = this.props;

    const borderColor = this.state.hover ? muiTheme && muiTheme.palette.accent2Color : muiTheme && muiTheme.palette.accent1Color

    return (
      <div className={newComment ? "comment-new" : "comment-old"}>
        <div className={"comments-node"}
          onMouseEnter={this.toggleHover}
          onMouseLeave={this.toggleHover}
          style={newComment ? {borderColor:borderColor} : {}}>

          <Components.CommentsItem
            collapsed={this.state.collapsed}
            toggleCollapse={this.toggleCollapse}
            currentUser={currentUser}
            comment={comment}
            key={comment._id}
            editMutation={editMutation}
          />
          {!this.state.collapsed && comment.childrenResults ?
              <div className="comments-children">

                {comment.childrenResults.map(comment =>
                  <CommentsNode currentUser={currentUser}
                    comment={comment}
                    key={comment._id}
                    muiTheme={muiTheme}
                    newComment={newComment}
                    editMutation={editMutation}
                  />)}
              </div>
              : null
            }
        </div>
      </div>
    )
  }
}

CommentsNode.propTypes = {
  comment: PropTypes.object.isRequired, // the current comment
};

replaceComponent('CommentsNode', CommentsNode, muiThemeable());
