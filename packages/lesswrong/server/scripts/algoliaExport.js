/* global Vulcan */
import { Posts } from '../../lib/collections/posts'
import { Comments } from '../../lib/collections/comments'
import Users from 'meteor/vulcan:users'
import { getCollection } from 'meteor/vulcan:lib';
import Sequences from '../../lib/collections/sequences/collection.js'
import { wrapVulcanAsyncScript } from './utils'
import { getAlgoliaAdminClient, algoliaIndexDocumentBatch, algoliaDeleteIds, subsetOfIdsAlgoliaShouldntIndex, algoliaGetAllDocuments } from '../search/utils';
import { forEachDocumentBatchInCollection } from '../queryUtil';
import keyBy from 'lodash/keyBy';
import { algoliaIndexNames } from '../../lib/algoliaIndexNames';

async function algoliaExport(collection, selector = {}, updateFunction) {
  let client = getAlgoliaAdminClient();
  if (!client) return;
  
  const indexName = algoliaIndexNames[collection.collectionName];
  // eslint-disable-next-line no-console
  console.log(`Exporting ${indexName}...`)
  let algoliaIndex = client.initIndex(indexName)
  
  // eslint-disable-next-line no-console
  console.log("Initiated Index connection")
  
  let totalErrors = [];
  const totalItems = collection.find(selector).count();
  let exportedSoFar = 0;
  
  await forEachDocumentBatchInCollection({collection, batchSize: 100, loadFactor: 0.5, callback: async (documents) => {
    await algoliaIndexDocumentBatch({ documents, collection, algoliaIndex,
      errors: totalErrors, updateFunction });
    
    exportedSoFar += documents.length;
    // eslint-disable-next-line no-console
    console.log(`Exported ${exportedSoFar}/${totalItems} entries to Algolia`);
  }});
  
  if (totalErrors.length) {
    // eslint-disable-next-line no-console
    console.log(`${collection._name} indexing encountered the following errors:`, totalErrors)
  } else {
    // eslint-disable-next-line no-console
    console.log('No errors found when indexing', collection._name)
  }
}

async function algoliaExportByCollectionName(collectionName) {
  switch (collectionName) {
    case 'Posts':
      await algoliaExport(Posts, {baseScore: {$gte: 0}, draft: {$ne: true}, status: 2})
      break
    case 'Comments':
      await algoliaExport(Comments, {baseScore: {$gt: 0}, isDeleted: {$ne: true}})
      break
    case 'Users':
      await algoliaExport(Users, {deleted: {$ne: true}})
      break
    case 'Sequences':
      await algoliaExport(Sequences)
      break
    default:
      throw new Error(`Did not recognize collectionName: ${collectionName}`)
  }
}

export async function algoliaExportAll() {
  for (let collectionName in algoliaIndexNames)
    await algoliaExportByCollectionName(collectionName);
}


Vulcan.runAlgoliaExport = wrapVulcanAsyncScript('runAlgoliaExport', algoliaExportByCollectionName)
Vulcan.runAlgoliaExportAll = wrapVulcanAsyncScript('runAlgoliaExportAll', algoliaExportAll)
Vulcan.algoliaExportAll = algoliaExportAll


// Go through the Algolia index for a collection, removing any documents which
// don't exist in mongodb or which exist but shouldn't be indexed. This plus
// algoliaExport together should result in a fully up to date Algolia index,
// regardless of the starting state.
async function algoliaCleanIndex(collection)
{
  let client = getAlgoliaAdminClient();
  if (!client) return;
  
  // eslint-disable-next-line no-console
  console.log(`Deleting spurious documents from Algolia index ${algoliaIndexNames[collection.collectionName]} for ${collection.collectionName}`);
  let algoliaIndex = client.initIndex(algoliaIndexNames[collection.collectionName]);
  
  // eslint-disable-next-line no-console
  console.log("Downloading the full index...");
  let allDocuments = await algoliaGetAllDocuments(algoliaIndex);
  
  // eslint-disable-next-line no-console
  console.log("Checking documents against the mongodb...");
  const ids = _.map(allDocuments, doc=>doc._id)
  const mongoIdsToDelete = await subsetOfIdsAlgoliaShouldntIndex(collection, ids); // TODO: Pagination
  const mongoIdsToDeleteDict = keyBy(mongoIdsToDelete, id=>id);
  
  const hitsToDelete = _.filter(allDocuments, doc=>doc._id in mongoIdsToDeleteDict);
  const algoliaIdsToDelete = _.map(hitsToDelete, hit=>hit.objectID);
  // eslint-disable-next-line no-console
  console.log(`Deleting ${mongoIdsToDelete.length} mongo IDs (${algoliaIdsToDelete.length} algolia IDs) from Algolia...`);
  await algoliaDeleteIds(algoliaIndex, algoliaIdsToDelete);
  // eslint-disable-next-line no-console
  console.log("Done.");
}

export async function algoliaCleanAll() {
  for (let collectionName in algoliaIndexNames)
    await algoliaCleanIndex(getCollection(collectionName));
}

Vulcan.algoliaCleanIndex = wrapVulcanAsyncScript('algoliaCleanIndex', algoliaCleanIndex);
Vulcan.algoliaCleanAll = wrapVulcanAsyncScript('algoliaCleanAll', algoliaCleanAll);
Vulcan.algoliaCleanAll = algoliaCleanAll
