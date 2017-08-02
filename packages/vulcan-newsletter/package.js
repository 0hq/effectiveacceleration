Package.describe({
  name: "vulcan:newsletter",
  summary: "Vulcan email newsletter package",
  version: '1.7.0',
  git: "https://github.com/VulcanJS/Vulcan.git"
});

Package.onUse(function (api) {

  api.versionsFrom("METEOR@1.0");

  api.use([
    'vulcan:core@1.7.0',
    'vulcan:posts@1.7.0',
    'vulcan:comments@1.7.0',
    'vulcan:categories@1.7.0',
    'vulcan:email@1.7.0'
  ]);

  api.mainModule('lib/server.js', 'server');
  api.mainModule('lib/client.js', 'client');

});
