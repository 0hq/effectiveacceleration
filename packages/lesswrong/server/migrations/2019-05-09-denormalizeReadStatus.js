import { forEachDocumentBatchInCollection, registerMigration } from './migrationUtils';
import { LWEvents } from '../../lib/collections/lwevents'
import { ReadStatuses } from '../../lib/collections/readStatus/collection.js'

registerMigration({
  name: "denormalizeReadStatus",
  idempotent: true,
  action: async () => {
    await forEachDocumentBatchInCollection({
      collection: LWEvents,
      batchSize: 1000,
      filter: {name: "post-view"},
      callback: async (postViews) => {
        // eslint-disable-next-line no-console
        console.log(`Updating batch of ${postViews.length} read statuses`);
        const updates = postViews.map(view => ({
          updateOne: {
            filter: {
              postId: view.documentId,
              userId: view.userId,
            },
            update: {
              $max: {
                lastUpdated: view.createdAt,
              },
              $set: {
                isRead: true
              },
            },
            upsert: true,
          }
        }));
        await ReadStatuses.rawCollection().bulkWrite(updates);
      }
    })
  }
});
