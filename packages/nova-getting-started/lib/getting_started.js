import Telescope from 'meteor/nova:lib';
import Posts from "meteor/nova:posts";
import Comments from "meteor/nova:comments";
import Users from 'meteor/nova:users';

Users.addField({
  fieldName: '__isDummy',
  fieldSchema: {
    type: Boolean,
    optional: true,
    control: "none" // never show this
  }
});

Posts.addField({
  fieldName: 'dummySlug',
  fieldSchema: {
    type: String,
    optional: true,
    control: "none" // never show this
  }
});

Posts.addField({
  fieldName: 'isDummy',
  fieldSchema: {
    type: Boolean,
    optional: true,
    control: "none" // never show this
  }
});

Comments.addField({
  fieldName: 'isDummy',
  fieldSchema: {
    type: Boolean,
    optional: true,
    control: "none" // never show this
  }
});

/**
 * @summary Copy over profile.isDummy to __isDummy on user creation
 * @param {Object} user – the user object being iterated on and returned
 * @param {Object} options – user options
 */
function copyDummyProperty (user, options) {
  if (typeof user.profile.isDummy !== "undefined") {
    user.__isDummy = user.profile.isDummy;
  }
  return user;
}
Telescope.callbacks.add("onCreateUser", copyDummyProperty);