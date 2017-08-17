Package.describe({
  name: "vulcan:getting-started",
  summary: "Getting started posts",
  version: '1.7.0',
  git: "https://github.com/VulcanJS/Vulcan.git"
});

Npm.depends({
  // NPM package dependencies
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.0']);

  api.use([
    'vulcan:core@1.7.0',
    'vulcan:posts@1.7.0',
    'vulcan:comments@1.7.0',
    'vulcan:events@1.7.0',
  ]);

  // client

  api.addAssets([
    'content/images/stackoverflow.png',
    'content/images/telescope.png'
  ], ['client']);

  // server

  api.addFiles([
    'lib/server/seed.js'
  ], ['server']);

  api.addAssets('content/read_this_first.md', 'server');
  api.addAssets('content/deploying.md', 'server');
  api.addAssets('content/customizing.md', 'server');
  api.addAssets('content/getting_help.md', 'server', 'server');
  api.addAssets('content/removing_getting_started_posts.md', 'server');

});
