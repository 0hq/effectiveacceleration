import { addGraphQLMutation, addGraphQLResolvers } from './vulcan-lib';
import { ReadStatuses } from '../lib/collections/readStatus/collection';


addGraphQLMutation('markAsReadOrUnread(postId: String, isRead:Boolean): Boolean');
addGraphQLResolvers({
  Mutation: {
    async markAsReadOrUnread(root, {postId, isRead}, context: ResolverContext) {
      const { currentUser } = context;
      if (!currentUser) return isRead;
      
      // TODO: Create an entry in LWEvents
      
      ReadStatuses.rawCollection().update({
        postId: postId,
        userId: currentUser._id,
      }, {
        $set: {
          isRead: isRead,
          lastUpdated: new Date(),
        },
      }, {
        upsert: true
      });
      
      return isRead;
    }
  }
});
