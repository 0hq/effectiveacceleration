import { Posts } from './collection'
import Users from 'meteor/vulcan:users'

// Example Forum permissions

const guestsActions = [
  'posts.view.approved'
];
Users.groups.guests.can(guestsActions);

const membersActions = [
  'posts.new',
  'posts.edit.own',
  'posts.remove.own',
  'posts.upvote',
  'posts.downvote',
];
Users.groups.members.can(membersActions);

const adminActions = [
  'posts.view.pending',
  'posts.view.rejected',
  'posts.view.spam',
  'posts.view.deleted',
  'posts.new.approved',
  'posts.edit.all',
  'posts.remove.all'
];
Users.groups.admins.can(adminActions);

// LessWrong Permissions

Posts.checkAccess = (currentUser, post) => {
  if (Users.isAdmin(currentUser)) {
    return true
  } else if (Users.owns(currentUser, post) || Users.isSharedOn(currentUser, post)) {
    return true;
  } else if (post.isFuture || post.draft) {
    return false;
  } else {
    const status = _.findWhere(Posts.statuses, {value: post.status});
    return Users.canDo(currentUser, `posts.view.${status.label}`);
  }
}

const votingActions = [
  'posts.smallDownvote',
  'posts.bigDownvote',
  'posts.smallUpvote',
  'posts.bigUpvote',
]

Users.groups.members.can(votingActions);

const sunshineRegimentActions = [
  'posts.edit.all',
  'posts.curate.all',
  'posts.suggestCurate',
  'posts.frontpage.all',
  'posts.moderate.all',
  'posts.commentLock.all'
];
Users.groups.sunshineRegiment.can(sunshineRegimentActions);


Users.groups.trustLevel1.can(['posts.moderate.own', 'posts.suggestCurate']);
Users.groups.canModeratePersonal.can(['posts.moderate.own.personal']);
Users.groups.canCommentLock.can(['posts.commentLock.own']);
