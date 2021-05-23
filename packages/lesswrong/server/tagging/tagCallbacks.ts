import { Tags } from '../../lib/collections/tags/collection';
import { TagRels } from '../../lib/collections/tagRels/collection';
import { Posts } from '../../lib/collections/posts/collection';
import Users from '../../lib/collections/users/collection';
import { voteCallbacks } from '../../lib/voting/vote';
import { performVoteServer } from '../voteServer';
import { getCollectionHooks } from '../mutationCallbacks';
import { updateDenormalizedContributorsList } from '../resolvers/tagResolvers';

function isValidTagName(name: string) {
  return true;
}

function normalizeTagName(name: string) {
  // If the name starts with a hash, strip it off
  if (name.startsWith("#"))
    return name.substr(1);
  else
    return name;
}

export async function updatePostDenormalizedTags(postId: string) {
  const tagRels: Array<DbTagRel> = await TagRels.find({postId: postId, deleted:false}).fetch();
  const tagRelDict: Partial<Record<string,number>> = {};
  
  for (let tagRel of tagRels) {
    if (tagRel.baseScore > 0)
      tagRelDict[tagRel.tagId] = tagRel.baseScore;
  }
  
  await Posts.update({_id:postId}, {$set: {tagRelevance: tagRelDict}});
}

getCollectionHooks("Tags").createValidate.add(async (validationErrors: Array<any>, {document: tag}: {document: DbTag}) => {
  if (!tag.name || !tag.name.length)
    throw new Error("Name is required");
  if (!isValidTagName(tag.name))
    throw new Error("Invalid tag name (use only letters, digits and dash)");
  
  // If the name starts with a hash, strip it off
  const normalizedName = normalizeTagName(tag.name);
  if (tag.name !== normalizedName) {
    tag = {
      ...tag,
      name: normalizedName,
    };
  }
  
  // Name must be unique
  const existing = await Tags.find({name: normalizedName, deleted:false}).fetch();
  if (existing.length > 0)
    throw new Error("A tag by that name already exists");
  
  return validationErrors;
});

getCollectionHooks("Tags").updateValidate.add(async (validationErrors: Array<any>, {oldDocument, newDocument}: {oldDocument: DbTag, newDocument: DbTag}) => {
  const newName = normalizeTagName(newDocument.name);
  if (oldDocument.name !== newName) { // Tag renamed?
    if (!isValidTagName(newDocument.name))
      throw new Error("Invalid tag name");
    
    const existing = await Tags.find({name: newName, deleted:false}).fetch();
    if (existing.length > 0)
      throw new Error("A tag by that name already exists");
  }
  
  if (newDocument.name !== newName) {
    newDocument = {
      ...newDocument, name: newName
    }
  }
  
  return validationErrors;
});

getCollectionHooks("Tags").updateAfter.add(async (newDoc: DbTag, {oldDocument}: {oldDocument: DbTag}) => {
  // If this is soft deleting a tag, then cascade to also soft delete any
  // tagRels that go with it.
  if (newDoc.deleted && !oldDocument.deleted) {
    await TagRels.update({ tagId: newDoc._id }, { $set: { deleted: true } }, { multi: true });
  }
  return newDoc;
});

getCollectionHooks("TagRels").newAfter.add(async (tagRel: DbTagRel) => {
  // When you add a tag, vote for it as relevant
  var tagCreator = await Users.findOne(tagRel.userId);
  const votedTagRel = tagCreator && await performVoteServer({ document: tagRel, voteType: 'smallUpvote', collection: TagRels, user: tagCreator })
  await updatePostDenormalizedTags(tagRel.postId);
  return {...tagRel, ...votedTagRel} as DbTagRel;
});

function voteUpdatePostDenormalizedTags({newDocument: tagRel, vote}: {
  newDocument: DbTagRel,
  vote: DbVote
}) {
  void updatePostDenormalizedTags(tagRel.postId);
}

voteCallbacks.cancelSync.add(voteUpdatePostDenormalizedTags);
voteCallbacks.castVoteAsync.add(voteUpdatePostDenormalizedTags);

async function recomputeContributorScoresFor(votedRevision: DbRevision, vote: DbVote) {
  if (vote.collectionName !== "Revisions") return;
  if (votedRevision.collectionName !== "Tags") return;
  
  const tag = await Tags.findOne({_id: votedRevision.documentId});
  if (!tag) return;
  await updateDenormalizedContributorsList(tag);
}

voteCallbacks.castVoteAsync.add(async ({newDocument: revision, vote}: {newDocument: DbRevision, vote: DbVote}) => {
  await recomputeContributorScoresFor(revision, vote);
});

voteCallbacks.cancelAsync.add(async ({newDocument: revision, vote}: {newDocument: DbRevision, vote: DbVote}) => {
  await recomputeContributorScoresFor(revision, vote);
});
