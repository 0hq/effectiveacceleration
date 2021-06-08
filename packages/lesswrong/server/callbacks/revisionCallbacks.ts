import { Revisions } from '../../lib/collections/revisions/collection';
import { Tags } from '../../lib/collections/tags/collection';
import { Users } from '../../lib/collections/users/collection';
import { afterCreateRevisionCallback } from '../editor/make_editable_callbacks';
import { performVoteServer } from '../voteServer';
import { updateDenormalizedHtmlAttributions } from '../resolvers/tagResolvers';

// TODO: Now that the make_editable callbacks use createMutator to create
// revisions, we can now add these to the regular ${collection}.create.after
// callbacks

// Users upvote their own tag-revisions
afterCreateRevisionCallback.add(async ({revisionID}) => {
  const revision = await Revisions.findOne({_id: revisionID});
  if (!revision) return;
  if (revision.collectionName !== 'Tags') return;
  
  const userId = revision.userId;
  const user = await Users.findOne({_id:userId});
  if (!user) return;
  await performVoteServer({ document: revision, voteType: 'smallUpvote', collection: Revisions, user })
});

// Update the denormalized htmlWithContributorAnnotations when a tag revision
// is created or edited
// Users upvote their own tag-revisions
afterCreateRevisionCallback.add(async ({revisionID}) => {
  const revision = await Revisions.findOne({_id: revisionID});
  if (!revision) return;
  if (revision.collectionName !== 'Tags') return;
  
  const tag = await Tags.findOne({_id: revision.documentId});
  if (!tag) return;
  await updateDenormalizedHtmlAttributions(tag);
});
