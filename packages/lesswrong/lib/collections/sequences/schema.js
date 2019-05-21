import { foreignKeyField } from '../../modules/utils/schemaUtils'
import { schemaDefaultValue } from '../../collectionUtils';

const schema = {

  // default properties

  _id: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
  },

  createdAt: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    onInsert: () => new Date(),
  },

  userId: {
    ...foreignKeyField({
      idFieldName: "userId",
      resolverName: "user",
      collectionName: "Users",
      type: "User",
    }),
    optional: true,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['admin'],
    hidden:  true,
  },

  // Custom Properties

  title: {
    type: String,
    optional: false,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
    order: 10,
    placeholder: "Sequence Title",
    control: 'EditSequenceTitle',
  },

  baseScore: {
    type: Number,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['admins'],
  },

  score: {
    type: Number,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['admins'],
  },

  color: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['admins'],
  },

  chaptersDummy: {
    type: Array,
    optional: true,
    viewableBy: ['guests'],
    resolveAs: {
      fieldName: 'chapters',
      type: '[Chapter]',
      resolver: (sequence, args, context) => {
        const books = context.Chapters.find({sequenceId: sequence._id}, {fields: context.Users.getViewableFields(context.currentUser, context.Chapters), sort: {number: 1}}).fetch();
        return books;
      }
    }
  },

  'chaptersDummy.$': {
    type: String,
    foreignKey: "Chapters",
    optional: true,
  },

  //Cloudinary image id for the grid Image
  gridImageId: {
    type: String,
    optional: true,
    order:25,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
    control: "ImageUpload",
    label: "Card Image"
  },

  //Cloudinary image id for the banner image (high resolution)
  bannerImageId: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
    label: "Banner Image",
    control: "ImageUpload",
  },

  curatedOrder: {
    type: Number,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['admins'],
  },

  draft: {
    type: Boolean,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
    control: "checkbox",
    ...schemaDefaultValue(false),
  },

  isDeleted: {
    type: Boolean,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
    hidden: true,
    control: "checkbox",
    ...schemaDefaultValue(false),
  },

  canonicalCollectionSlug: {
    type: String,
    foreignKey: {
      collection: "Collections",
      field: "slug",
    },
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['admins'],
    hidden: false,
    control: "text",
    order: 30,
    label: "Collection Slug",
    resolveAs: {
      fieldName: 'canonicalCollection',
      addOriginalField: true,
      type: "Collection",
      // TODO: Make sure we run proper access checks on this. Using slugs means it doesn't
      // work out of the box with the id-resolver generators
      resolver: (sequence, args, context) => {
        if (!sequence.canonicalCollectionSlug) return null;
        return context.Collections.findOne({slug: sequence.canonicalCollectionSlug})
      }
    }
  },

  hidden: {
    type: Boolean,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['sunshineRegiment'],
    insertableBy: ['sunshineRegiment'],
    ...schemaDefaultValue(false),
  }
}


export default schema;
