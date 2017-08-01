Package.describe({
  name: "vulcan:base-components",
  summary: "Vulcan components package",
  version: '1.6.1',
  git: "https://github.com/VulcanJS/Vulcan.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.0']);

  api.use([
    // Vulcan packages
    'vulcan:core@1.6.1',
    'vulcan:posts@1.6.1',
    'vulcan:comments@1.6.1',
    'vulcan:voting@1.6.1',
    'vulcan:accounts@1.6.1',
    'vulcan:categories@1.6.1',
  ]);

  api.mainModule("lib/server.js", "server");
  api.mainModule("lib/client.js", "client");

});
