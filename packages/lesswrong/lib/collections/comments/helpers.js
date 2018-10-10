import { Posts } from '../posts'
import { Comments } from './index'
import Users from "meteor/vulcan:users"
import { getSetting } from 'meteor/vulcan:core'

// Example Forum Helpers


//////////////////
// Link Helpers //
//////////////////

/**
 * @summary Get URL of a comment page.
 * @param {Object} comment
 */
Comments.getPageUrl = function(comment, isAbsolute = false){
  const post = Posts.findOne(comment.postId);
  return `${Posts.getPageUrl(post, isAbsolute)}/#${comment._id}`;
};

///////////////////
// Other Helpers //
///////////////////

/**
 * @summary Get a comment author's name
 * @param {Object} comment
 */
Comments.getAuthorName = function (comment) {
  var user = Users.findOne(comment.userId);
  return user ? Users.getDisplayName(user) : comment.author;
};

// LessWrong Helpers

/**
 * @summary Get URL of a comment page.
 * @param {Object} comment
 */
// LW: Overwrite the original example-forum Comments.getPageUrl
Comments.getPageUrl = function(comment, isAbsolute = false){
  const post = Posts.findOne(comment.postId);
  return `${Posts.getPageUrl(post, isAbsolute)}#${comment._id}`;
};

// URL for RSS feed of all direct replies
Comments.getRSSUrl = function(comment, isAbsolute = false){
  const prefix = isAbsolute ? Utils.getSiteUrl().slice(0,-1) : '';
  return `${prefix}/feed.xml?type=comments&view=commentReplies&parentCommentId=${comment._id}`;
};

Comments.defaultToAlignment = (currentUser, post, comment) => {
  if (getSetting('AlignmentForum', false)) { return true }
  if (comment) {
    return (Users.canDo(currentUser, "comments.alignment.new") && post.af && comment.af)
  } else {
    return (Users.canDo(currentUser, "comments.alignment.new") && post.af)
  }
}

Comments.getDefaultView = (post, currentUser) => {

  return (post && post.commentSortOrder) || (currentUser && currentUser.commentSorting) || "postCommentsTop"
}
