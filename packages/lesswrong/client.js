
import './client/vulcan-lib/main';
import './lib/vulcan-lib';
import './client/vulcan-core/start';

// Make sure to register settings before everything else
import './lib/registerSettings'

// Then import the google analytics stuff
import './client/ga';

// Then import google reCaptcha v3
import './client/reCaptcha'

// Then do the rest
import './client/disconnect_meteor';
import './client/themeProvider';
import './client/logging';
export * from './lib/index';

// Polyfills:
import 'element-closest'
