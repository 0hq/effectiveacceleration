import { Components, registerComponent, getSetting } from 'meteor/vulcan:core';
import React, { Component } from 'react';

class WrappedLoginForm extends Component
{
  state = {
    reCaptchaToken: null
  };
  
  setReCaptchaToken = (token) => {
    this.setState({reCaptchaToken: token})
  }
  
  render() {
    const customSignupFields = [
      {
        id: "subscribeToCurated",
        type: 'custom',
        defaultValue: true,
        renderCustom: Components.SignupSubscribeToCurated
      }
    ]
    
    return <React.Fragment>
      {getSetting('reCaptcha.apiKey')
        && <Components.ReCaptcha verifyCallback={this.setReCaptchaToken} action="login/signup"/>}
      <Components.AccountsLoginForm
        onPreSignUpHook={(options) => {
          const reCaptchaToken = this.state.reCaptchaToken
          return {...options, profile: {...options.profile, reCaptchaToken}}
        }}
        customSignupFields={customSignupFields}
      />
    </React.Fragment>;
  }
}

registerComponent('WrappedLoginForm', WrappedLoginForm);
