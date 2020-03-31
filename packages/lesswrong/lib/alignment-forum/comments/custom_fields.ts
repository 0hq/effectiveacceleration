import { Comments } from "../../collections/comments";
import { arrayOfForeignKeysField, addFieldsDict, foreignKeyField } from '../../utils/schemaUtils'
import { getSetting } from '../../vulcan-lib';
import { schemaDefaultValue } from '../../collectionUtils';

export const alignmentOptionsGroup = {
  order: 50,
  name: "alignment",
  label: "Alignment Options",
  startCollapsed: true
};

const alignmentForum = getSetting('forumType') === 'AlignmentForum'

addFieldsDict(Comments, {
  af: {
    type: Boolean,
    optional: true,
    label: "AI Alignment Forum",
    ...schemaDefaultValue(false),
    viewableBy: ['guests'],
    editableBy: ['alignmentForum', 'admins'],
    insertableBy: ['alignmentForum', 'admins'],
    hidden: (props) => alignmentForum || !props.alignmentForumPost
  },

  afBaseScore: {
    type: Number,
    optional: true,
    label: "Alignment Base Score",
    viewableBy: ['guests'],
  },

  suggestForAlignmentUserIds: {
    ...arrayOfForeignKeysField({
      idFieldName: "suggestForAlignmentUserIds",
      resolverName: "suggestForAlignmentUsers",
      collectionName: "Users",
      type: "User"
    }),
    viewableBy: ['members'],
    editableBy: ['alignmentForum', 'alignmentForumAdmins'],
    optional: true,
    label: "Suggested for Alignment by",
    control: "UsersListEditor",
    group: alignmentOptionsGroup,
  },
  'suggestForAlignmentUserIds.$': {
    type: String,
    optional: true
  },

  reviewForAlignmentUserId: {
    type: String,
    optional: true,
    group: alignmentOptionsGroup,
    viewableBy: ['guests'],
    editableBy: ['alignmentForumAdmins', 'admins'],
    label: "AF Review UserId"
  },

  afDate: {
    order:10,
    type: Date,
    optional: true,
    label: "Alignment Forum",
    defaultValue: false,
    hidden: true,
    viewableBy: ['guests'],
    editableBy: ['alignmentForum', 'alignmentForumAdmins', 'admins'],
    insertableBy: ['alignmentForum', 'alignmentForumAdmins', 'admins'],
    group: alignmentOptionsGroup,
  },

  moveToAlignmentUserId: {
    ...foreignKeyField({
      idFieldName: "moveToAlignmentUserId",
      resolverName: "moveToAlignmentUser",
      collectionName: "Users",
      type: "User",
    }),
    optional: true,
    hidden: true,
    viewableBy: ['guests'],
    editableBy: ['alignmentForum', 'alignmentForumAdmins', 'admins'],
    group: alignmentOptionsGroup,
    label: "Move to Alignment UserId",
  },
})
