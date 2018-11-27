import { LWEvents } from "./collection.js"
import { ensureIndex } from '../../collectionUtils';

LWEvents.addView("adminView", function (terms) {
  return {
    selector: {name: terms.name || null},
    options: {sort: {createdAt: -1}}
  };
});
ensureIndex(LWEvents, {name:1, createdAt:-1});

LWEvents.addView("postVisits", function (terms) {
  return {
    selector: {
      documentId: terms.postId,
      userId: terms.userId,
      name: "post-view",
      deleted: {$in: [false,null]}
    },
    options: {sort: {createdAt: -1}, limit: terms.limit || 1},
  };
});
// Index also supports the LWEvents.findOne in the `lastVisitedAt` resolver
// (very speed critical)
ensureIndex(LWEvents, {name:1, userId:1, documentId:1, createdAt:-1})
