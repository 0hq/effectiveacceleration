import Users from '../../lib/collections/users/collection';
import { Vulcan, editMutation, getCollection, Utils } from '../vulcan-lib';
import { Revisions } from '../../lib/index';
import { editableCollectionsFields } from '../../lib/editor/make_editable'
import ReadStatuses from '../../lib/collections/readStatus/collection';
import { Votes } from '../../lib/collections/votes/index';
import { Conversations } from '../../lib/collections/conversations/collection'
import sumBy from 'lodash/sumBy';



const transferOwnership = async ({documentId, targetUserId, collection, fieldName = "userId"}) => {
  await editMutation({
    collection,
    documentId,
    set: {[fieldName]: targetUserId},
    unset: {},
    validate: false,
  })
}

const transferCollection = async ({sourceUserId, targetUserId, collectionName, fieldName = "userId"}) => {
  const collection = getCollection(collectionName)
  const documents = await collection.find({[fieldName]: sourceUserId}).fetch()
  // eslint-disable-next-line no-console
  console.log(`Transferring ${documents.length} documents in collection ${collectionName}`)
  for (const doc of documents) {
    await transferOwnership({documentId: doc._id, targetUserId, collection, fieldName})
    // Transfer ownership of all revisions and denormalized references for editable fields
    const editableFieldNames = editableCollectionsFields[collectionName]
    if (editableFieldNames?.length) {
      editableFieldNames.forEach((editableFieldName) => {
        transferEditableField({documentId: doc._id, targetUserId, collection, fieldName: editableFieldName})
      })
    }
  }
  documents.forEach((doc) => {
    
  })
}

const transferEditableField = ({documentId, targetUserId, collection, fieldName = "contents"}) => {
  // Update the denormalized revision on the document
  editMutation({
    collection,
    documentId,
    set: {[`${fieldName}.userId`]: targetUserId},
    unset: {},
    validate: false
  })
  // Update the revisions themselves
  Revisions.update({ documentId, fieldName }, {$set: {userId: targetUserId}}, { multi: true })
}

const mergeReadStatusForPost = ({sourceUserId, targetUserId, postId}) => {
  const sourceUserStatus = ReadStatuses.findOne({userId: sourceUserId, postId})
  const targetUserStatus = ReadStatuses.findOne({userId: targetUserId, postId})
  const readStatus = new Date(sourceUserStatus?.lastUpdated) > new Date(targetUserStatus?.lastUpdated) ? sourceUserStatus?.isRead : targetUserStatus?.isRead
  const lastUpdated = new Date(sourceUserStatus?.lastUpdated) > new Date(targetUserStatus?.lastUpdated) ? sourceUserStatus?.lastUpdated : targetUserStatus?.lastUpdated
  if (targetUserStatus) {
    ReadStatuses.update({_id: targetUserStatus._id}, {$set: {isRead: readStatus, lastUpdated}})
  } else if (sourceUserStatus) {
    // eslint-disable-next-line no-unused-vars
    const {_id, ...sourceUserStatusWithoutId} = sourceUserStatus
    ReadStatuses.insert({...sourceUserStatusWithoutId, userId: targetUserId})
  }
}

Vulcan.mergeAccounts = async (sourceUserId, targetUserId) => {
  const sourceUser = Users.findOne({_id: sourceUserId})
  const targetUser = Users.findOne({_id: targetUserId})

  // Transfer posts
  await transferCollection({sourceUserId, targetUserId, collectionName: "Posts"})

  // Transfer comments
  await transferCollection({sourceUserId, targetUserId, collectionName: "Comments"})

  // Transfer conversations
  await Conversations.update({participantIds: sourceUserId}, {$set: {"participantIds.$": targetUserId}}, { multi: true })

  // Transfer private messages
  await transferCollection({sourceUserId, targetUserId, collectionName: "Messages"})

  // Transfer notifications
  await transferCollection({sourceUserId, targetUserId, collectionName: "Notifications"})

  // Transfer readStatuses
  const readStatuses = await ReadStatuses.find({userId: sourceUserId}).fetch()
  const readPostIds = readStatuses.map((status) => status.postId)
  readPostIds.forEach((postId) => {
    mergeReadStatusForPost({sourceUserId, targetUserId, postId})
  })

  // Transfer sequences
  await transferCollection({sourceUserId, targetUserId, collectionName: "Sequences"})
  await transferCollection({sourceUserId, targetUserId, collectionName: "Collections"})

  // Transfer localgroups
  await transferCollection({sourceUserId, targetUserId, collectionName: "Localgroups"})
  
  // Transfer karma
  // eslint-disable-next-line no-console
  console.log("Transferring karma")
  const newKarma = await recomputeKarma(targetUserId)
  await editMutation({
    collection: Users,
    documentId: targetUserId,
    set: {
      karma: newKarma, 
      // We only recalculate the karma for non-af karma, because recalculating
      // af karma is a lot more complicated
      afKarma: sourceUser.afKarma + targetUser.afKarma 
    },
    validate: false
  })
  
  // Transfer votes that target content from source user (authorId)
  // eslint-disable-next-line no-console
  console.log("Transferring votes that target source user")
  await Votes.update({authorId: sourceUserId}, {$set: {authorId: targetUserId}}, {multi: true})

  // Transfer votes cast by source user
  // eslint-disable-next-line no-console
  console.log("Transferring votes cast by source user")
  await Votes.update({userId: sourceUserId}, {$set: {userId: targetUserId}}, {multi: true})
  
  // Change slug of source account by appending "old" and reset oldSlugs array
  // eslint-disable-next-line no-console
  console.log("Change slugs of source account")
  await Users.update({_id: sourceUserId}, {slug: Utils.getUnusedSlug(Users, `${sourceUser.slug}-old`, true)})

  // Add slug to oldSlugs array of target account
  const newOldSlugs = [
    ...(targetUser.oldSlugs || []), 
    ...(sourceUser.oldSlugs || []), 
    sourceUser.slug
  ]
  // eslint-disable-next-line no-console
  console.log("Changing slugs of target account", sourceUser.slug, newOldSlugs)
  
  await editMutation({
    collection: Users,
    documentId: targetUserId,
    set: {oldSlugs: newOldSlugs}, 
    validate: false
  })
  
  // Mark old acccount as deleted
  // eslint-disable-next-line no-console
  console.log("Marking old account as deleted")
  await editMutation({
    collection: Users,
    documentId: sourceUserId,
    set: {deleted: true},
    validate: false
  })
}


async function recomputeKarma(userId) {
  const user = await Users.findOne({_id: userId})
  if (!user) throw Error("Can't find user")
  const allTargetVotes = await Votes.find({
    authorId: user._id,
    userId: {$ne: user._id},
    legacy: {$ne: true},
    cancelled: false
  }).fetch()
  const totalNonLegacyKarma = sumBy(allTargetVotes, vote => {
    return vote.power
  })
  // @ts-ignore FIXME legacyKarma isn't in the schema, figure out whether it's real
  const totalKarma = totalNonLegacyKarma + (user.legacyKarma || 0)
  return totalKarma
}

Vulcan.getTotalKarmaForUser = recomputeKarma
