// Useful methods on users
getCurrentUserEmail = function(){
	return Meteor.user() ? Meteor.user().emails[0].address : '';
}

userProfileComplete = function(user) {
  return !!user.profile.email;
}