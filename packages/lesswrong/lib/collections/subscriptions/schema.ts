import { userOwns } from '../../vulcan-users/permissions';
import { foreignKeyField } from '../../utils/schemaUtils'
import { schemaDefaultValue } from '../../collectionUtils'

export const subscriptionTypes = {
  newComments: 'newComments',
  newShortform: 'newShortform',
  newPosts: 'newPosts',
  newRelatedQuestions: 'newRelatedQuestions',
  newEvents: 'newEvents',
  newReplies: 'newReplies',
  newTagPosts: 'newTagPosts'
}

const schema: SchemaType<DbSubscription> = {
  createdAt: {
    type: Date,
    optional: true,
    canRead: [userOwns],
    onCreate: () => new Date(),
  },
  userId: {
    ...foreignKeyField({
      idFieldName: "userId",
      resolverName: "user",
      collectionName: "Users",
      type: "User",
      nullable: false,
    }),
    onCreate: ({currentUser}) => currentUser!._id,
    canRead: [userOwns],
    optional: true,
  },
  state: {
    type: String,
    allowedValues: ['subscribed', 'suppressed'],
    canCreate: ['members'],
    canRead: [userOwns],
  },
  documentId: {
    type: String,
    canRead: [userOwns],
    canCreate: ['members']
  },
  collectionName: {
    type: String, 
    typescriptType: "CollectionNameString",
    canRead: [userOwns],
    canCreate: ['members']
  },
  deleted: {
    type: Boolean,
    canRead: [userOwns],
    ...schemaDefaultValue(false),
    optional: true
  },
  type: {
    type: String,
    allowedValues: Object.values(subscriptionTypes),
    canCreate: ['members'],
    canRead: [userOwns]
  }
};

export default schema;
