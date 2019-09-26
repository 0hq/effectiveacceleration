import { registerMigration, migrateDocuments } from './migrationUtils';
import { LegacyData } from '../../lib/collections/legacyData/collection.js';
import { Comments } from '../../lib/collections/comments/collection.js';
import { Posts } from '../../lib/collections/posts/collection.js';
import Users from 'meteor/vulcan:users';

registerMigration({
  name: "moveLegacyData",
  idempotent: true,
  action: async () => {
    for(let collection of [Comments, Posts, Users])
    {
      await migrateDocuments({
        description: "Move legacyData to legacyData collection",
        collection: collection,
        batchSize: 100,
        unmigratedDocumentQuery: {
          legacyData: {$exists:true},
        },
        migrate: async (documents) => {
          // Write legacyData into legacyData table
          const addNewUpdates = _.map(documents, doc => {
            return {
              insertOne: {
                objectId: doc._id,
                collectionName: collection.collectionName,
                legacyData: doc.legacyData
              }
            };
          });
          await LegacyData.rawCollection().bulkWrite(
            addNewUpdates,
            { ordered: false }
          );
          
          
          // Remove legacyData from the other collection
          const removeOldUpdates = _.map(documents, doc => {
            return {
              updateOne: {
                filter: {_id: doc._id},
                update: {
                  $unset: {legacyData:""}
                }
              }
            };
          });
          await collection.rawCollection().bulkWrite(
            removeOldUpdates,
            { ordered: false }
          );
        },
      });
    }
  }
});
