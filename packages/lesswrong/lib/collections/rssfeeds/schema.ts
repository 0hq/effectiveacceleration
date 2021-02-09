import { foreignKeyField } from '../../utils/schemaUtils'
import { schemaDefaultValue } from '../../collectionUtils';

const schema: SchemaType<DbRSSFeed> = {
  userId: {
    ...foreignKeyField({
      idFieldName: "userId",
      resolverName: "user",
      collectionName: "Users",
      type: "User",
      nullable: true,
    }),
    hidden: true,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['admins'],
    optional: true,
  },
  createdAt: {
    optional: true,
    type: Date,
    viewableBy: ['guests'],
    onInsert: (document, currentUser) => new Date(),
  },
  ownedByUser: {
    type: Boolean,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['admins'],
    control: "checkbox",
    optional: true,
    order: 30,
    defaultValue: false,
  },
  displayFullContent: {
    type: Boolean,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['admins'],
    control: "checkbox",
    optional: true,
    order: 40,
    defaultValue: false,
  },
  nickname: {
    type: String,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['admins'],
    optional: true,
    order: 10,
  },
  url: {
    type: String,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['admins'],
    optional: true,
    order: 20,
  },
  // Set to 'inactive' to prevent posting
  status: {
    type: String,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    optional: true,
  },
  rawFeed: {
    type: Object,
    hidden: true,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['admins'],
    optional: true,
  },
  setCanonicalUrl: {
    type: Boolean,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    optional: true,
    control: "checkbox",
    label: "Set the canonical url tag on crossposted posts",
    ...schemaDefaultValue(false)
  }
};

export default schema;
