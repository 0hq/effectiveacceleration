import { schemaDefaultValue } from '../../collectionUtils'
import { arrayOfForeignKeysField, denormalizedCountOfReferences, foreignKeyField, resolverOnlyField, accessFilterMultiple } from '../../utils/schemaUtils';
import SimpleSchema from 'simpl-schema';
import { Utils, slugify } from '../../vulcan-lib/utils';
import { getWithLoader } from '../../loaders';
import moment from 'moment';

const formGroups = {
  advancedOptions: {
    name: "advancedOptions",
    order: 20,
    label: "Advanced Options",
    startCollapsed: true,
  },
};

export const schema: SchemaType<DbTag> = {
  createdAt: {
    optional: true,
    type: Date,
    canRead: ['guests'],
    onInsert: (document, currentUser) => new Date(),
  },
  name: {
    type: String,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    order: 1,
  },
  slug: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    insertableBy: ['admins', 'sunshineRegiment'],
    editableBy: ['admins', 'sunshineRegiment'],
    group: formGroups.advancedOptions,
    onInsert: tag => {
      const basicSlug = slugify(tag.name);
      return Utils.getUnusedSlugByCollectionName('Tags', basicSlug, true);
    },
    onUpdate: async ({data, oldDocument}) => {
      if (data.slug && data.slug !== oldDocument.slug) {
        const slugIsUsed = await Utils.slugIsUsed("Tags", data.slug)
        if (slugIsUsed) {
          throw Error(`Specified slug is already used: ${data.slug}`)
        }
      } else if (data.name && data.name !== oldDocument.name) {
        return Utils.getUnusedSlugByCollectionName("Tags", slugify(data.name), true, oldDocument._id)
      }
    }
  },
  oldSlugs: {
    type: Array,
    optional: true,
    canRead: ['guests'],
    onUpdate: ({data, oldDocument}) => {
      if ((data.slug && data.slug !== oldDocument.slug) || (data.name && data.name !== oldDocument.name))  {
        return [...(oldDocument.oldSlugs || []), oldDocument.slug]
      } 
    }
  },
  'oldSlugs.$': {
    type: String,
    optional: true,
    canRead: ['guests'],
  },
  core: {
    label: "Core Tag (moderators check whether it applies when reviewing new posts)",
    type: Boolean,
    viewableBy: ['guests'],
    insertableBy: ['admins', 'sunshineRegiment'],
    editableBy: ['admins', 'sunshineRegiment'],
    group: formGroups.advancedOptions,
    optional: true,
    ...schemaDefaultValue(false),
  },
  suggestedAsFilter: {
    label: "Suggested Filter (appears as a default option in filter settings without having to use the search box)",
    type: Boolean,
    viewableBy: ['guests'],
    insertableBy: ['admins', 'sunshineRegiment'],
    editableBy: ['admins', 'sunshineRegiment'],
    group: formGroups.advancedOptions,
    optional: true,
    ...schemaDefaultValue(false),
  },
  defaultOrder: {
    type: Number,
    viewableBy: ['guests'],
    insertableBy: ['admins', 'sunshineRegiment'],
    editableBy: ['admins', 'sunshineRegiment'],
    group: formGroups.advancedOptions,
    optional: true,
    ...schemaDefaultValue(0),
  },
  descriptionTruncationCount: {
    // number of paragraphs to display above-the-fold
    type: Number,
    viewableBy: ['guests'],
    insertableBy: ['admins', 'sunshineRegiment'],
    editableBy: ['admins', 'sunshineRegiment'],
    group: formGroups.advancedOptions,
    optional: true,
    ...schemaDefaultValue(0),
  },
  postCount: {
    ...denormalizedCountOfReferences({
      fieldName: "postCount",
      collectionName: "Tags",
      foreignCollectionName: "TagRels",
      foreignTypeName: "TagRel",
      foreignFieldName: "tagId",
      //filterFn: tagRel => tagRel.baseScore > 0, //TODO: Didn't work with filter; votes are bypassing the relevant callback?
    }),
    viewableBy: ['guests'],
  },
  userId: {
    ...foreignKeyField({
      idFieldName: "userId",
      resolverName: "user",
      collectionName: "Users",
      type: "User",
      nullable: true,
    }),
    onCreate: ({currentUser}) => currentUser!._id,
    viewableBy: ['guests'],
    optional: true
  },
  adminOnly: {
    label: "Admin Only",
    type: Boolean,
    viewableBy: ['guests'],
    insertableBy: ['admins', 'sunshineRegiment'],
    editableBy: ['admins', 'sunshineRegiment'],
    group: formGroups.advancedOptions,
    optional: true,
    ...schemaDefaultValue(false),
  },
  charsAdded: {
    type: Number,
    optional: true,
    viewableBy: ['guests'],
  },
  charsRemoved: {
    type: Number,
    optional: true,
    viewableBy: ['guests'],
  },
  deleted: {
    type: Boolean,
    viewableBy: ['guests'],
    editableBy: ['admins', 'sunshineRegiment'],
    optional: true,
    group: formGroups.advancedOptions,
    ...schemaDefaultValue(false),
  },
  lastCommentedAt: {
    type: Date,
    denormalized: true,
    optional: true,
    viewableBy: ['guests'],
  },
  needsReview: {
    type: Boolean,
    canRead: ['guests'],
    canUpdate: ['admins', 'sunshineRegiment'],
    group: formGroups.advancedOptions,
    optional: true,
    ...schemaDefaultValue(true)
  },
  reviewedByUserId: {
    ...foreignKeyField({
      idFieldName: "reviewedByUserId",
      resolverName: "reviewedByUser",
      collectionName: "Users",
      type: "User",
    }),
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['sunshineRegiment', 'admins'],
    insertableBy: ['sunshineRegiment', 'admins'],
    hidden: true,
  },
  // What grade is the current tag? See the wikiGradeDefinitions variable defined below for details.
  wikiGrade: {
    type: SimpleSchema.Integer, 
    canRead: ['guests'],
    canUpdate: ['admins', 'sunshineRegiment'],
    canCreate: ['admins', 'sunshineRegiment'],
    control: 'select',
    options: () => Object.entries(wikiGradeDefinitions).map(([grade, name]) => ({
      value: parseInt(grade),
      label: name
    })),
    group: formGroups.advancedOptions,
    optional: true,
    ...schemaDefaultValue(2),
  },
  
  recentComments: resolverOnlyField({
    type: Array,
    graphQLtype: "[Comment]",
    viewableBy: ['guests'],
    graphqlArguments: 'tagCommentsLimit: Int, maxAgeHours: Int, af: Boolean',
    resolver: async (tag, { tagCommentsLimit=5, maxAgeHours=18, af=false }, context: ResolverContext) => {
      const { currentUser, Comments } = context;
      const timeCutoff = moment(tag.lastCommentedAt).subtract(maxAgeHours, 'hours').toDate();
      const comments = await Comments.find({
        ...Comments.defaultView({}).selector,
        tagId: tag._id,
        score: {$gt:0},
        deletedPublic: false,
        postedAt: {$gt: timeCutoff},
        ...(af ? {af:true} : {}),
      }, {
        limit: tagCommentsLimit,
        sort: {postedAt:-1}
      }).fetch();
      return await accessFilterMultiple(currentUser, Comments, comments, context);
    }
  }),
  'recentComments.$': {
    type: Object,
    foreignKey: 'Comments',
  },

  wikiOnly: {
    type: Boolean,
    canRead: ['guests'],
    canUpdate: ['admins', 'sunshineRegiment'],
    canCreate: ['admins', 'sunshineRegiment'],
    group: formGroups.advancedOptions,
    optional: true,
    ...schemaDefaultValue(false),
  },

  tagFlagsIds: {
    ...arrayOfForeignKeysField({
      idFieldName: "tagFlagsIds",
      resolverName: "tagFlags",
      collectionName: "TagFlags",
      type: "TagFlag",
    }),
    control: 'TagFlagToggleList',
    label: "Flags: ",
    order: 30,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['members', 'sunshineRegiment', 'admins'],
    insertableBy: ['sunshineRegiment', 'admins']
  },
  'tagFlagsIds.$': {
    type: String,
    foreignKey: 'TagFlags',
    optional: true
  },
  // Populated by the LW 1.0 wiki import, with the revision number
  // that has the last full state of the imported post
  lesswrongWikiImportRevision: {
    type: String,
    optional: true,
    viewableBy: ['guests']
  },
  lesswrongWikiImportSlug: {
    type: String,
    optional: true,
    viewableBy: ['guests']
  },
  lesswrongWikiImportCompleted: {
    type: Boolean,
    optional: true,
    viewableBy: ['guests']
  },
  
  // lastVisitedAt: If the user is logged in and has viewed this tag, the date
  // they last viewed it. Otherwise, null.
  lastVisitedAt: resolverOnlyField({
    type: Date,
    viewableBy: ['guests'],
    optional: true,
    resolver: async (tag: DbTag, args: void, context: ResolverContext) => {
      const { ReadStatuses, currentUser } = context;
      if (!currentUser) return null;

      const readStatus = await getWithLoader(context, ReadStatuses,
        `tagReadStatuses`,
        { userId: currentUser._id },
        'tagId', tag._id
      );
      if (!readStatus.length) return null;
      return readStatus[0].lastUpdated;
    }
  }),
  
  isRead: resolverOnlyField({
    type: Boolean,
    viewableBy: ['guests'],
    optional: true,
    resolver: async (tag: DbTag, args: void, context: ResolverContext) => {
      const { ReadStatuses, currentUser } = context;
      if (!currentUser) return false;
      
      const readStatus = await getWithLoader(context, ReadStatuses,
        `tagReadStatuses`,
        { userId: currentUser._id },
        'tagId', tag._id
      );
      if (!readStatus.length) return false;
      return readStatus[0].isRead;
    }
  }),

}

export const wikiGradeDefinitions = {
  0: "Uncategorized",
  1: "Flagged",
  2: "Stub",
  3: "C-Class",
  4: "B-Class",
  5: "A-Class"
}
