Package.describe({
  name: "vulcan:embedly",
  summary: "Vulcan Embedly module package",
  version: '1.7.0',
  git: 'https://github.com/VulcanJS/Vulcan.git'
});

Package.onUse( function(api) {

  api.versionsFrom("METEOR@1.0");

  api.use([
    'vulcan:core@1.7.0',
    'vulcan:posts@1.7.0',
    'fourseven:scss@4.5.0'
  ]);


  api.addFiles([
    'lib/stylesheets/embedly.scss'
  ], ['client']);

  api.mainModule('lib/client/main.js', 'client');
  api.mainModule('lib/server/main.js', 'server');

});
