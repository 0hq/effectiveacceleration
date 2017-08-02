Package.describe({
  name: "vulcan:core",
  summary: "Vulcan core package",
  version: '1.7.0',
  git: "https://github.com/VulcanJS/Vulcan.git"
});

Package.onUse(function(api) {

  api.versionsFrom("METEOR@1.0");

  api.use([
    'vulcan:lib@1.7.0',
    'vulcan:i18n@1.7.0',
    'vulcan:users@1.7.0',
    'vulcan:routing@1.7.0'
  ]);

  api.imply([
    'vulcan:lib@1.7.0'
  ]);

  api.mainModule('lib/server/main.js', 'server');
  api.mainModule('lib/client/main.js', 'client');

});
