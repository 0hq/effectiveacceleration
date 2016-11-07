import Telescope from 'meteor/nova:lib';
import MailChimpList from './mailchimp/mailchimp_list.js';
import Users from 'meteor/nova:users';

function subscribeUserOnProfileCompletion (user) {
  if (!!Telescope.settings.get('autoSubscribe') && !!Users.getEmail(user)) {
    try {
      MailChimpList.add(user, false, function (error, result) {
        console.log(error);
        console.log(result);
      });
    } catch (error) {
      console.log("// MailChimp Error:")
      console.log(error)
    }
  }
  return user;
}
Telescope.callbacks.add("users.profileCompleted.async", subscribeUserOnProfileCompletion);