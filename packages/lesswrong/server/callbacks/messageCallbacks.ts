import Conversations from '../../lib/collections/conversations/collection'
import { getCollectionHooks } from '../mutationCallbacks';

getCollectionHooks("Messages").createAsync.add(function unArchiveConversations({document}) {
  void Conversations.update({_id:document.conversationId}, {$set: {archivedByIds: []}});
});
