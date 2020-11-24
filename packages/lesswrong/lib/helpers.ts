import { Utils, getCollection } from './vulcan-lib';


// Get relative link to conversation (used only in session)
export const conversationGetLink = (conversation: HasIdType): string => {
  return `/inbox/${conversation._id}`;
};

// Get relative link to conversation of message (conversations are only linked to relatively)
export const messageGetLink = (message: DbMessage): string => {
  return `/inbox/${message.conversationId}`;
};

// LESSWRONG version of getting unused slug. Modified to also include "oldSlugs" array
Utils.getUnusedSlug = function <T extends HasSlugType>(collection: CollectionBase<HasSlugType>, slug: string, useOldSlugs = false, documentId?: string): string {
  let suffix = '';
  let index = 0;
  
  let existingDocuments = getDocumentsBySlug({slug, suffix, useOldSlugs, collection})
  // test if slug is already in use
  while (!!existingDocuments?.length) {
    // Filter out our own document (i.e. don't change the slug if the only conflict is with ourselves)
    const conflictingDocuments = existingDocuments.filter((doc) => doc._id !== documentId)
    // If there are other documents we conflict with, change the index and slug, then check again
    if (!!conflictingDocuments.length) {
      index++
      suffix = '-'+index;
      existingDocuments = getDocumentsBySlug({slug, suffix, useOldSlugs, collection})
    } else {
      break
    }
  }
  return slug+suffix;
};

const getDocumentsBySlug = <T extends HasSlugType>({slug, suffix, useOldSlugs, collection}: {
  slug: string,
  suffix: string,
  useOldSlugs: boolean,
  collection: CollectionBase<T>
}): Array<T> => {
  return collection.find(useOldSlugs ? 
    {$or: [{slug: slug+suffix},{oldSlugs: slug+suffix}]} : 
    {slug: slug+suffix}
  ).fetch()
}

// LESSWRONG version of getting unused slug by collection name. Modified to also include "oldSlugs" array
Utils.getUnusedSlugByCollectionName = function (collectionName: CollectionNameString, slug: string, useOldSlugs = false, documentId?: string): string {
  // Not enforced: collectionName is a collection that has slugs
  const collection = getCollection(collectionName) as CollectionBase<HasSlugType>;
  return Utils.getUnusedSlug(collection, slug, useOldSlugs, documentId)
};

Utils.slugIsUsed = async (collectionName: CollectionNameString, slug: string): Promise<boolean> => {
  const collection = getCollection(collectionName)
  const existingUserWithSlug = await collection.findOne({$or: [{slug: slug},{oldSlugs: slug}]})
  return !!existingUserWithSlug
}
