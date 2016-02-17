Package.describe({
  name: "telescope:posts",
  summary: "Telescope posts package",
  version: "0.25.7",
  git: "https://github.com/TelescopeJS/telescope-posts.git"
});

// Npm.depends({
//   'react-komposer': '1.3.1'
// });

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.0']);

  api.use([
    'telescope:core@0.25.7',
    // 'telescope:i18n@0.25.7',
    // 'telescope:settings@0.25.7',
    // 'telescope:users@0.25.7',
    // 'telescope:comments@0.25.7'
  ]);

  api.use([
    'telescope:notifications@0.25.7'
  ], ['client', 'server'], {weak: true});

  api.addFiles([
    'lib/config.js',
    'lib/collection.js',
    'lib/parameters.js',
    'lib/notifications.js',
    'lib/views.js',
    'lib/helpers.js',
    'lib/published_fields.js',
    'lib/callbacks.js',
    'lib/methods.js'
  ], ['client', 'server']);

  api.addFiles([
    'lib/server/publications.js',
    'lib/server/notifications/routes.js',
    'lib/server/notifications/templates.js'
  ], ['server']);

  api.addAssets([
    'lib/server/notifications/templates/emailNewPost.handlebars',
    'lib/server/notifications/templates/emailNewPendingPost.handlebars',
    'lib/server/notifications/templates/emailPostApproved.handlebars',
  ], ['server']);

  // var languages = ["ar", "bg", "cs", "da", "de", "el", "en", "es", "et", "fr", "hu", "id", "it", "ja", "kk", "ko", "nl", "pl", "pt-BR", "ro", "ru", "sl", "sv", "th", "tr", "vi", "zh-CN"];
  // var languagesPaths = languages.map(function (language) {
  //   return "i18n/"+language+".i18n.json";
  // });
  // api.addFiles(languagesPaths, ["client", "server"]);

  api.export([
    'Posts'
  ]);

});
