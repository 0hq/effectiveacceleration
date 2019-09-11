
import { registerMigration, migrateDocuments } from './migrationUtils';
import { draftJSToHtmlWithLatex, markdownToHtml} from '../editor/make_editable_callbacks'
import { Posts } from '../../lib/collections/posts'
import { editMutation } from 'meteor/vulcan:core';

registerMigration({
  name: "fixBigPosts",
  idempotent: true,
  action: async () => {
    await migrateDocuments({
      description: `Fix the posts that are really big`,
      collection: Posts,
      batchSize: 1000,
      unmigratedDocumentQuery: {
        $where: '(this.htmlBody && this.htmlBody.length) > 3000000'
      }, 
      migrate: async (documents) => {
        for (const doc of documents) {
          const { body, content, htmlBody } = doc
          let newHtml
          if (content) {
            newHtml = await draftJSToHtmlWithLatex(content)
          } else if (body) {
            newHtml = await markdownToHtml(body)
          } else {
            newHtml = htmlBody
          }
          
          await editMutation({
            collection: Posts,
            documentId: doc._id,
            set: {
              htmlBody: newHtml
            },
            validate: false
          });
        }
      }
    })  
  },
});
