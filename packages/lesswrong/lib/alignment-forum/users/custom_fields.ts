import Users from "../../collections/users/collection";
import { formGroups } from "../../collections/users/custom_fields"
import { addFieldsDict, denormalizedCountOfReferences } from '../../utils/schemaUtils'
import { Posts } from '../../collections/posts';

addFieldsDict(Users, {
  afKarma: {
    type: Number,
    optional: true,
    label: "Alignment Base Score",
    canRead: ['guests'],
  },

  afPostCount: {
    ...denormalizedCountOfReferences({
      fieldName: "afPostCount",
      collectionName: "Users",
      foreignCollectionName: "Posts",
      foreignTypeName: "post",
      foreignFieldName: "userId",
      filterFn: (post) => (post.af && !post.draft && post.status===Posts.config.STATUS_APPROVED),
    }),
    canRead: ['guests'],
  },

  afCommentCount: {
    type: Number,
    optional: true,
    onInsert: (document, currentUser) => 0,
    ...denormalizedCountOfReferences({
      fieldName: "afCommentCount",
      collectionName: "Users",
      foreignCollectionName: "Comments",
      foreignTypeName: "comment",
      foreignFieldName: "userId",
      filterFn: (comment) => comment.af,
    }),
    canRead: ['guests'],
  },

  afSequenceCount: {
    ...denormalizedCountOfReferences({
      fieldName: "afSequenceCount",
      collectionName: "Users",
      foreignCollectionName: "Sequences",
      foreignTypeName: "sequence",
      foreignFieldName: "userId",
      filterFn: sequence => sequence.af && !sequence.draft && !sequence.isDeleted
    }),
    canRead: ['guests'],
  },

  afSequenceDraftCount: {
    ...denormalizedCountOfReferences({
      fieldName: "afSequenceDraftCount",
      collectionName: "Users",
      foreignCollectionName: "Sequences",
      foreignTypeName: "sequence",
      foreignFieldName: "userId",
      filterFn: sequence => sequence.af && sequence.draft && !sequence.isDeleted
    }),
    canRead: ['guests'],
  },

  reviewForAlignmentForumUserId: {
    type: String,
    optional: true,
    canRead: ['guests'],
    canUpdate: ['alignmentForumAdmins', 'admins'],
    canCreate: ['alignmentForumAdmins', 'admins'],
    group: formGroups.adminOptions,
    label: "AF Review UserId"
  },

  groups: {
    canUpdate: ['alignmentForumAdmins', 'admins'],
  },
  'groups.$': {
    type: String,
    optional: true
  },

  afApplicationText: {
    type: String,
    optional: true,
    canRead: [Users.owns, 'alignmentForumAdmins', 'admins'],
    canUpdate: [Users.owns, 'admins'],
    hidden: true,
  },

  afSubmittedApplication: {
    type: Boolean,
    optional: true,
    canRead: [Users.owns, 'alignmentForumAdmins', 'admins'],
    canUpdate: [Users.owns, 'admins'],
    canCreate: ['admins'],
    hidden: true,
  }
});
