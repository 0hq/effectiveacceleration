import { createCollection } from '../../vulcan-lib';
import { addUniversalFields, getDefaultResolvers, getDefaultMutations, schemaDefaultValue } from '../../collectionUtils'
import { foreignKeyField } from '../../utils/schemaUtils'
import { makeVoteable } from '../../make_voteable';
import { userCanUseTags } from '../../betas';

const schema = {
  tagId: {
    ...foreignKeyField({
      idFieldName: "tagId",
      resolverName: "tag",
      collectionName: "Tags",
      type: "Tag",
    }),
    canRead: ['guests'],
    canCreate: ['members'],
  },
  postId: {
    ...foreignKeyField({
      idFieldName: "postId",
      resolverName: "post",
      collectionName: "Posts",
      type: "Post",
    }),
    canRead: ['guests'],
    canCreate: ['members'],
  },
  deleted: {
    type: Boolean,
    viewableBy: ['guests'],
    editableBy: ['admins', 'sunshineRegiment'],
    hidden: true,
    optional: true,
    ...schemaDefaultValue(false),
  },
  // The user who first tagged the post with this tag
  userId: {
    ...foreignKeyField({
      idFieldName: "userId",
      resolverName: "user",
      collectionName: "Users",
      type: "User",
    }),
    canRead: ['guests'],
    canCreate: ['members'],
  },
  afBaseScore: {
    type: Number,
    optional: true,
    label: "Alignment Base Score",
    viewableBy: ['guests'],
  },

};

export const TagRels: TagRelsCollection = createCollection({
  collectionName: 'TagRels',
  typeName: 'TagRel',
  schema,
  resolvers: getDefaultResolvers('TagRels'),
  mutations: getDefaultMutations('TagRels', {
    newCheck: (user, tag) => {
      return userCanUseTags(user);
    },
    editCheck: (user, tag) => {
      return userCanUseTags(user);
    },
    removeCheck: (user, tag) => {
      return false;
    },
  }),
});

TagRels.checkAccess = (currentUser, tagRel) => {
  if (userCanUseTags(currentUser))
    return true;
  else if (tagRel.deleted)
    return false;
  else
    return true;
}

addUniversalFields({collection: TagRels})
makeVoteable(TagRels);

export default TagRels;
