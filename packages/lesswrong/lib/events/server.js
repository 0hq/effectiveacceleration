import { getSetting } from 'meteor/vulcan:lib';
import Intercom from 'intercom-client';

// Initiate Intercom on the server
const intercomToken = getSetting("intercomToken", null);
let intercomClient = null;
if (intercomToken) {
  intercomClient = new Intercom.Client({ token: intercomToken });
}

import './callbacks_async.js';


export default intercomClient;
