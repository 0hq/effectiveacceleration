import schema from './schema';
import { createCollection, getCollection } from '../../vulcan-lib';
import { addUniversalFields, getDefaultResolvers } from '../../collectionUtils'
import { userCanDo, membersGroup } from '../../vulcan-users/permissions';
import { extractVersionsFromSemver } from '../../editor/utils';
import { makeVoteable } from '../../make_voteable';

export const Revisions: RevisionsCollection = createCollection({
  collectionName: 'Revisions',
  typeName: 'Revision',
  schema,
  resolvers: getDefaultResolvers('Revisions'),
  // No mutations (revisions are insert-only immutable, and are created as a
  // byproduct of creating/editing documents in other collections).
  // mutations: getDefaultMutations('Revisions'),
});
addUniversalFields({collection: Revisions})

// Note, since we want to make sure checkAccess is a performant function, we can only check the 
// userId of the current revision for ownership. If the userId of the document the revision is on,
// and the revision itself differ (e.g. because an admin has made the edit, or a coauthor), then
// we will hide those revisions unless they are marked as post-1.0.0 releases. This is not ideal, but
// seems acceptable
Revisions.checkAccess = async (user: DbUser|null, revision: DbRevision, context: ResolverContext|null): Promise<boolean> => {
  if (!revision) return false
  if ((user && user._id) === revision.userId) return true
  if (userCanDo(user, 'posts.view.all')) return true
  // not sure why some revisions have no collectionName,
  // but this will cause an error below so just exclude them
  if (!revision.collectionName) return false
  
  // Get the document that this revision is a field of, and check for access to
  // it. This is necessary for correctly handling things like posts' draft
  // status and sharing settings.
  //
  // We might or might not have a ResolverContext (because some places, like
  // email-sending, don't have one). If we do, use its loader; in the typical
  // case, this will hit in the cache 100% of the time. If we don't have a
  // ResolverContext, use a findOne query; this is slow, but doesn't come up
  // in any contexts where speed matters.
  const { major: majorVersion } = extractVersionsFromSemver(revision.version)
  const collectionName= revision.collectionName;
  const documentId = revision.documentId;
  const collection = getCollection(collectionName);
  const document = context
    ? await context.loaders[collectionName].load(documentId)
    : await collection.findOne(documentId);
  
  // We only allow access to draft revisions to the author of the document
  // But on wiki/tag pages, major version 0 means "imported from old wiki" rather
  // than "draft" (since there is no concept of wiki pages being drafts).
  if (majorVersion < 1
    && revision.userId !== (user && user._id)
    && revision.collectionName!=="Tags")
  {
    return false
  }
  
  if (!await collection.checkAccess(user, document, context)) return false; // Everyone who can see the post can get access to non-draft revisions
  
  return true;
}

export interface ChangeMetrics {
  added: number
  removed: number
}

makeVoteable(Revisions, {
  timeDecayScoresCronjob: false,
});

membersGroup.can([
  'revisions.smallDownvote',
  'revisions.bigDownvote',
  'revisions.smallUpvote',
  'revisions.bigUpvote',
]);

export default Revisions;
