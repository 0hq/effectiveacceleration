Package.describe({
  name: 'vulcan:lib',
  summary: 'Telescope libraries.',
  version: '1.3.0',
  git: "https://github.com/TelescopeJS/Telescope.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.0']);

  var packages = [

    // Meteor packages

    'meteor-base',
    'mongo',
    'tracker',
    'service-configuration',
    'standard-minifiers',
    'modules',
    'accounts-base',
    'check',
    'http',
    'email',
    'tracker',
    'ecmascript',
    'service-configuration',
    'shell-server',

    // Third-party packages

    'aldeed:collection2-core@2.0.0',
    'meteorhacks:picker@1.0.3',
    'percolatestudio:synced-cron@1.1.0',
    'jparker:gravatar@0.4.1',
    'meteorhacks:inject-initial@1.0.4',
  ];

  api.use(packages);

  api.imply(packages);

  // api.export([
  //   'Telescope'
  // ]);

  api.mainModule('lib/server/main.js', 'server');
  api.mainModule('lib/client/main.js', 'client');

});
