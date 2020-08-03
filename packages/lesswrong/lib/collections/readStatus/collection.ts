import { createCollection } from '../../vulcan-lib';
import { addUniversalFields, ensureIndex } from '../../collectionUtils'
import { foreignKeyField, SchemaType } from '../../utils/schemaUtils'

const schema: SchemaType<DbReadStatus> = {
  postId: {
    ...foreignKeyField({
      idFieldName: "postId",
      resolverName: "post",
      collectionName: "Posts",
      type: "Post",
    }),
  },
  userId: {
    ...foreignKeyField({
      idFieldName: "userId",
      resolverName: "user",
      collectionName: "Users",
      type: "User",
    }),
  },
  isRead: {
    type: Boolean,
  },
  lastUpdated: {
    type: Date,
  },
};

export const ReadStatuses: ReadStatusesCollection = createCollection({
  collectionName: "ReadStatuses",
  typeName: "ReadStatus",
  schema
});

addUniversalFields({collection: ReadStatuses});

ensureIndex(ReadStatuses, {userId:1, postId:1, isRead:1, lastUpdated:1})

export default ReadStatuses;
