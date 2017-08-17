import { Picker } from 'meteor/meteorhacks:picker';

import VulcanEmail from '../namespace.js';

Meteor.startup(function () {

  _.forEach(VulcanEmail.emails, (email, key) => {

    // template live preview routes
    Picker.route(email.path, (params, req, res) => {

      let html;

      // if email has a custom way of generating test HTML, use it
      if (typeof email.getTestHTML !== "undefined") {

        html = email.getTestHTML.bind(email)(params);

      } else {

        // else get test object (sample post, comment, user, etc.)
        const testObject = email.getTestObject(params._id);

        // get test object's email properties
        const properties = email.getProperties(testObject);

        // then apply email template to properties, and wrap it with buildTemplate
        html = VulcanEmail.buildTemplate(VulcanEmail.getTemplate(email.template)(properties));

        html += `
          <div style="border: 1px solid #999; padding: 20px; margin: 20px;">
            <pre>
            <code>
              ${JSON.stringify(properties, null, '\t')}
            </code>
            </pre>
          </div>
        `
      }

      // return html
      res.end(html);

    });

    // raw template
    Picker.route("/email/template/:template", (params, req, res) => {
      res.end(VulcanEmail.templates[params.template]);
    });

  });

});
