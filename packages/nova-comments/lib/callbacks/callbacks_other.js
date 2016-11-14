import Telescope from 'meteor/nova:lib';
import Posts from "meteor/nova:posts";
import Comments from '../collection.js';
import Users from 'meteor/nova:users';

function UsersRemoveDeleteComments (user, options) {
  if (options.deleteComments) {
    var deletedComments = Comments.remove({userId: userId});
  } else {
    // not sure if anything should be done in that scenario yet
    // Comments.update({userId: userId}, {$set: {author: "\[deleted\]"}}, {multi: true});
  }
}
Telescope.callbacks.add("users.remove.async", UsersRemoveDeleteComments);

// Add to posts.single publication

function PostsSingleAddCommentsUsers (users, post) {
  // get IDs from all commenters on the post
  const comments = Comments.find({postId: post._id}).fetch();
  if (comments.length) {
    users = users.concat(_.pluck(comments, "userId"));
  }
  return users;
}
Telescope.callbacks.add("posts.single.getUsers", PostsSingleAddCommentsUsers);
