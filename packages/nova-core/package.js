Package.describe({
  name: "telescope:core",
  summary: "Telescope core package",
  version: "0.25.7",
  git: "https://github.com/TelescopeJS/Telescope.git"
});

Package.onUse(function(api) {

  api.versionsFrom("METEOR@1.0");
  
  var packages = [
    'telescope:lib@0.25.7', //  no dependencies
    // 'telescope:messages@0.25.7', // lib
    // 'telescope:i18n@0.25.7', // lib
    'telescope:events@0.25.7', // lib, i18n
    'telescope:settings@0.25.7', // lib, i18n
  ];

  api.use(packages);
  
  api.imply(packages);

  api.addFiles([
    'lib/components.js',
    'lib/callbacks.js'
  ], ['client', 'server']);

  api.addAssets([
    // 'public/img/loading.svg',
  ], 'client');

  api.addFiles([
    'lib/server/start.js',
    'lib/server/routes.js'
  ], ['server']);

  // var languages = ["ar", "bg", "cs", "da", "de", "el", "en", "es", "et", "fr", "hu", "id", "it", "ja", "kk", "ko", "nl", "pl", "pt-BR", "ro", "ru", "sl", "sv", "th", "tr", "vi", "zh-CN"];
  // var languagesPaths = languages.map(function (language) {
  //   return "i18n/"+language+".i18n.json";
  // });
  // api.addFiles(languagesPaths, ["client", "server"]);

});
