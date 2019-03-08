import { Posts } from "../../../collections/posts";
import { formGroups } from "../../../collections/posts/custom_fields.js"
import { arrayOfForeignKeysField, addFieldsDict } from '../../../modules/utils/schemaUtils'
import { schemaDefaultValue } from '../../../collectionUtils';

addFieldsDict(Posts, {
  af: {
    order:10,
    type: Boolean,
    optional: true,
    label: "Alignment Forum",
    ...schemaDefaultValue(false),
    viewableBy: ['guests'],
    editableBy: ['alignmentForum'],
    insertableBy: ['alignmentForum'],
    control: 'checkbox',
    group: formGroups.options,
  },

  afDate: {
    order:10,
    type: Date,
    optional: true,
    label: "Alignment Forum",
    hidden: true,
    viewableBy: ['guests'],
    editableBy: ['alignmentForum'],
    insertableBy: ['alignmentForum'],
    group: formGroups.options,
  },

  afBaseScore: {
    type: Number,
    optional: true,
    label: "Alignment Base Score",
    viewableBy: ['guests'],
  },

  afCommentCount: {
    type: Number,
    optional: true,
    defaultValue: 0,
    hidden:true,
    label: "Alignment Comment Count",
    viewableBy: ['guests'],
  },

  afLastCommentedAt: {
    type: Date,
    optional: true,
    hidden: true,
    viewableBy: ['guests'],
    onInsert: () => new Date(),
  },

  afSticky: {
    order: 10,
    type: Boolean,
    optional: true,
    label: "Sticky (Alignment)",
    ...schemaDefaultValue(false),
    group: formGroups.adminOptions,
    viewableBy: ['guests'],
    editableBy: ['alignmentForumAdmins', 'admins'],
    insertableBy: ['alignmentForumAdmins', 'admins'],
    control: 'checkbox',
    onInsert: (post) => {
      if(!post.afSticky) {
        return false;
      }
    },
    onEdit: (modifier, post) => {
      if (!(modifier.$set && modifier.$set.afSticky)) {
        return false;
      }
    }
  },

  suggestForAlignmentUserIds: {
    ...arrayOfForeignKeysField({
      idFieldName: "suggestForAlignmentUserIds",
      resolverName: "suggestForAlignmentUsers",
      collectionName: "Users",
      type: "User"
    }),
    viewableBy: ['members'],
    insertableBy: ['sunshineRegiment', 'admins'],
    editableBy: ['alignmentForum', 'alignmentForumAdmins'],
    optional: true,
    label: "Suggested for Alignment by",
    control: "UsersListEditor",
    group: formGroups.adminOptions,
  },
  'suggestForAlignmentUserIds.$': {
    type: String,
    optional: true
  },

  reviewForAlignmentUserId: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['alignmentForumAdmins', 'admins'],
    insertableBy: ['alignmentForumAdmins', 'admins'],
    group: formGroups.adminOptions,
    label: "AF Review UserId"
  },
});
