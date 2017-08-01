Package.describe({
  name: "vulcan:forms-upload",
  summary: "Vulcan package extending vulcan:forms to upload images to Cloudinary from a drop zone.",
  version: "1.6.1",
  git: 'https://github.com/xavcz/nova-forms-upload.git'
});

Package.onUse( function(api) {

  api.versionsFrom("METEOR@1.0");

  api.use([
    'vulcan:core@1.6.1',
    'vulcan:forms@1.6.1',
    'fourseven:scss@4.5.0'
  ]);

  api.addFiles([
    "lib/Upload.scss"
  ], "client");

  api.mainModule("lib/modules.js", ["client", "server"]);

});
