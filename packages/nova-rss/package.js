Package.describe({
  name: "nova:rss",
  summary: "Telescope RSS package",
  version: "0.26.5-nova",
  git: "https://github.com/TelescopeJS/telescope-rss.git"
});

Npm.depends({rss: "1.1.1"});

Package.onUse(function (api) {

  api.use(['nova:core@0.26.5-nova']);

  api.addFiles(['lib/headtags.js'], ['client', 'server']);

  api.addFiles(['lib/server/rss.js', 'lib/server/routes.js'], ['server']);

});