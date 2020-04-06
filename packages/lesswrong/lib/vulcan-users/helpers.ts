import { Utils } from '../vulcan-lib';
import Users from '../collections/users/collection';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';

////////////////////
//  User Getters  //
////////////////////

/**
 * @summary Get a user
 * @param {String} userOrUserId
 */
Users.getUser = function(userOrUserId: DbUser|string|undefined): DbUser {
  if (typeof userOrUserId === 'undefined') {
    if (!Meteor.user()) {
      throw new Error();
    } else {
      return Meteor.user();
    }
  } else if (typeof userOrUserId === 'string') {
    return Users.findOne(userOrUserId);
  } else {
    return userOrUserId;
  }
};

/**
 * @summary Get a user's username (unique, no special characters or spaces)
 * @param {Object} user
 */
Users.getUserName = function(user: UsersMinimumInfo|DbUser|null): string|null {
  try {
    if (user?.username) return user.username;
  } catch (error) {
    console.log(error); // eslint-disable-line
    return null;
  }
};

Users.getDisplayNameById = function(userId: string): string {
  return Users.getDisplayName(Users.findOne(userId));
};

/**
 * @summary Get a user's account edit URL
 * @param {Object} user (note: we only actually need either the _id or slug properties)
 * @param {Boolean} isAbsolute
 */
Users.getEditUrl = function(user: DbUser|UsersMinimumInfo|null, isAbsolute=false): string {
  return `${Users.getProfileUrl(user, isAbsolute)}/edit`;
};

/**
 * @summary Get a user's GitHub name
 * @param {Object} user
 */
Users.getGitHubName = function(user: DbUser): string|null {
  // return twitter name provided by user, or else the one used for twitter login
  if (Utils.checkNested(user, 'profile', 'github')) {
    return user.profile.github;
  } else if (Utils.checkNested(user, 'services', 'github', 'screenName')) {
    // TODO: double-check this with GitHub login
    return user.services.github.screenName;
  }
  return null;
};
/**
 * @summary Get a user's email
 * @param {Object} user
 */
Users.getEmail = function(user: DbUser): string|null {
  if (user.email) {
    return user.email;
  } else {
    return null;
  }
};

////////////////////
//  User Checks   //
////////////////////

///////////////////
// Other Helpers //
///////////////////

Users.findLast = function<T extends HasCreatedAtType>(user: DbUser, collection: CollectionBase<T>): T {
  return collection.findOne({ userId: user._id }, { sort: { createdAt: -1 } });
};

Users.timeSinceLast = function<T extends HasCreatedAtType>(user: DbUser, collection: CollectionBase<T>): number {
  var now = new Date().getTime();
  var last = this.findLast(user, collection);
  if (!last) return 999; // if this is the user's first post or comment ever, stop here
  return Math.abs(Math.floor((now - last.createdAt.getTime()) / 1000));
};

Users.numberOfItemsInPast24Hours = function<T extends DbObject>(user: DbUser, collection: CollectionBase<T>, filter?: Record<string,any>): number {
  var mNow = moment();
  var items = collection.find({
    userId: user._id,
    ...filter,
    createdAt: {
      $gte: mNow.subtract(24, 'hours').toDate(),
    },
  });
  return items.count();
};

////////////////////
// More Helpers   //
////////////////////

// helpers that don't take a user as argument

Users.findByEmail = function(email: string): DbUser|null {
  return Users.findOne({ email: email });
};
