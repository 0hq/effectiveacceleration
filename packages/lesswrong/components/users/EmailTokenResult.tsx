import React from 'react';
import { registerComponent } from '../../lib/vulcan-lib';

const EmailTokenResult = ({message}) => {
  return <div>{message}</div>
}

const EmailTokenResultComponent = registerComponent("EmailTokenResult", EmailTokenResult);

declare global {
  interface ComponentTypes {
    EmailTokenResult: typeof EmailTokenResultComponent
  }
}
