import { Components, registerComponent, withCurrentUser } from 'meteor/vulcan:core';
import React, { PureComponent } from 'react';
import Users from 'meteor/vulcan:users';

const EmailConfirmationRequiredCheckbox = (props) => {
  let { currentUser, label, ...otherProps } = props;
  
  if(Users.emailAddressIsVerified(currentUser)) {
    return (
      <Components.FormComponentCheckbox
        {...props}
      />
    );
  } else {
    return (
      <Components.FormComponentCheckbox
        disabled
        {...otherProps}
        label={`${label} (verify your email address first)`}
      />
    );
  }
}

registerComponent("EmailConfirmationRequiredCheckbox", EmailConfirmationRequiredCheckbox, withCurrentUser);