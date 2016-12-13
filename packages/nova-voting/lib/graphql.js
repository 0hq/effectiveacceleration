import Posts from 'meteor/nova:posts';
import { GraphQLSchema } from 'meteor/nova:core';
import { operateOnItem } from './vote.js';

const voteSchema = `
  type Vote {
    itemId: String
    power: Float
    votedAt: String
  }
`;

GraphQLSchema.addSchema(voteSchema);

GraphQLSchema.addMutation('postsVote(documentId: String, voteType: String) : Post');

const voteResolver = {
  Mutation: {
    postsVote(root, {documentId, voteType}, context) {
      const post = Posts.findOne(documentId);
      return context.Users.canDo(context.currentUser, `posts.${voteType}`) ? operateOnItem(context.Posts, post, context.currentUser, voteType) : false;
    },
  },
};

GraphQLSchema.addResolvers(voteResolver);