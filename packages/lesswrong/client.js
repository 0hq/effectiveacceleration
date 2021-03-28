import './client/mingoUpdates';
import './client/apolloClient';
import './lib/vulcan-lib';
import './client/start';

// Make sure to register settings before everything else
import './client/publicSettings'

// Then import the google analytics stuff
import './client/ga';

// Then import google reCaptcha v3
import './client/reCaptcha'

// Then do the rest
import './client/autoRefresh';
import './client/scrollRestoration';
import './client/themeProvider';
import './client/logging';
import './lib/index';

// Polyfills:
import 'element-closest'
