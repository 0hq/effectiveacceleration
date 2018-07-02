import { Components, replaceComponent } from 'meteor/vulcan:core';
import { withRouter } from 'react-router';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import muiThemeable from 'material-ui/styles/muiThemeable';

const KARMA_COLLAPSE_THRESHOLD = -4;

class CommentsNode extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      collapsed: props && props.comment && (props.comment.baseScore < KARMA_COLLAPSE_THRESHOLD || props.comment.deleted),
      finishedScroll: false,
    };
  }

  componentDidMount() {
    let commentHash = this.props.router.location.hash;
    const self = this;
    if (commentHash === "#" + this.props.comment._id) {
      setTimeout(function () { //setTimeout make sure we execute this after the element has properly rendered
        self.scrollIntoView()
      }, 0);
    }
  }

  scrollIntoView = (event) => {
    this.refs.comment.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
    this.setState({finishedScroll: true});
  }

  toggleCollapse = () => {
    this.setState({collapsed: !this.state.collapsed});
  }

  toggleHover = () => {
    this.setState({hover: !this.state.hover});
  }

  render() {
    const {
      comment,
      currentUser,
      highlightDate,
      editMutation,
      post,
      muiTheme,
      router,
      frontPage,
    } = this.props;
    const newComment = highlightDate && (new Date(comment.postedAt).getTime() > new Date(highlightDate).getTime())
    const borderColor = this.state.hover ? muiTheme && muiTheme.palette.accent2Color : muiTheme && muiTheme.palette.accent1Color
    const nodeClass = classNames("comments-node", {
      "af":comment.af,
      "comments-node-root" : comment.level === 1,
      "comments-node-even" : comment.level % 2 === 0,
      "comments-node-odd"  : comment.level % 2 != 0,
      "comments-node-linked" : router.location.hash === "#" + comment._id && this.state.finishedScroll,
      "comments-node-deleted" : comment.deleted,
      "comments-node-its-getting-nested-here": comment.level > 8,
      "comments-node-so-take-off-all-your-margins": comment.level > 12,
      "comments-node-im-getting-so-nested": comment.level > 16,
      "comments-node-im-gonna-drop-my-margins": comment.level > 20,
      "comments-node-what-are-you-even-arguing-about": comment.level > 24,
      "comments-node-are-you-sure-this-is-a-good-idea": comment.level > 28,
      "comments-node-seriously-what-the-fuck": comment.level > 32,
      "comments-node-are-you-curi-and-lumifer-specifically": comment.level > 36,
      "comments-node-cuz-i-guess-that-makes-sense-but-like-really-tho": comment.level > 40,
    })

    return (
      <div className={newComment ? "comment-new" : "comment-old"}>
        <div className={nodeClass}
          onMouseEnter={this.toggleHover}
          onMouseLeave={this.toggleHover}
          id={comment._id}
          style={newComment ? {borderLeft:"solid 5px " + borderColor} : {}}>
          <div ref="comment">
            <Components.CommentsItem
              collapsed={this.state.collapsed}
              toggleCollapse={this.toggleCollapse}
              currentUser={currentUser}
              comment={comment}
              key={comment._id}
              editMutation={editMutation}
              scrollIntoView={this.scrollIntoView}
              post={post}
              frontPage={frontPage}
            />
          </div>
          {!this.state.collapsed && comment.childrenResults ?
            <div className="comments-children">
              <div className="comments-parent-scroll" onClick={this.scrollIntoView}></div>
              {comment.childrenResults.map(comment =>
                <Components.CommentsNode currentUser={currentUser}
                  comment={comment}
                  key={comment._id}
                  muiTheme={muiTheme}
                  highlightDate={highlightDate}
                  editMutation={editMutation}
                  post={post}
                  frontPage={frontPage}
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
  router: PropTypes.object.isRequired
};

replaceComponent('CommentsNode', CommentsNode, withRouter, muiThemeable());
