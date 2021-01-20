import SimpleSchema from 'simpl-schema';
import { foreignKeyField } from '../../utils/schemaUtils'

const schema: SchemaType<DbBan> = {
  createdAt: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    onInsert: (document, currentUser) => new Date(),
  },
  expirationDate: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['sunshineRegiment', 'admins'],
    insertableBy: ['sunshineRegiment', 'admins'],
    control: 'datetime',
  },
  userId: {
    ...foreignKeyField({
      idFieldName: "userId",
      resolverName: "user",
      collectionName: "Users",
      type: "User",
      nullable: true
    }),
    viewableBy: ['guests'],
    editableBy: ['sunshineRegiment', 'admins'],
    insertableBy: ['sunshineRegiment', 'admins'],
    optional: true,
    hidden: true,
  },
  ip: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['sunshineRegiment', 'admins'],
    insertableBy: ['sunshineRegiment', 'admins'],
    regEx: SimpleSchema.RegEx.IP,
  },
  reason: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['sunshineRegiment', 'admins'],
    insertableBy: ['sunshineRegiment', 'admins'],
    label: 'Reason (shown to the user)',
  },
  comment: {
    type: String,
    optional:true,
    viewableBy: ['guests'],
    editableBy: ['sunshineRegiment', 'admins'],
    insertableBy: ['sunshineRegiment', 'admins'],
    label: 'Comment (shown to other mods)',
  },
  properties: {
    type: Object,
    optional: true,
    blackbox: true,
    viewableBy: ['guests'],
    editableBy: ['sunshineRegiment', 'admins'],
    insertableBy: ['sunshineRegiment', 'admins'],
    hidden: true,
  },
};

export default schema;
