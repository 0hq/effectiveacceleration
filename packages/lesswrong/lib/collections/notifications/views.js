// import { getSetting } from '../../vulcan-lib';
import Notifications from './collection';
import { ensureIndex } from '../../collectionUtils';


// will be common to all other view unless specific properties are overwritten
Notifications.addDefaultView(function (terms) {
  // const alignmentForum = getSetting('forumType') === 'AlignmentForum' ? {af: true} : {}
  return {
    selector: {
      // ...alignmentForum, TODO: develop better notification system for AlignmentForum that properly filters 
      emailed: false,
      waitingForBatch: false,
    },
    options: {limit: 1000},
  };
});

// notifications for a specific user (what you see in the notifications menu)
Notifications.addView("userNotifications", (terms) => {
  return {
    selector: {
      userId: terms.userId,
      type: terms.type || null,
      viewed: terms.viewed == null ? null : (terms.viewed || false)
    }, //Ugly construction to deal with falsy viewed values and null != false in Mongo
    options: {sort: {createdAt: -1}}
  }
});
ensureIndex(Notifications, {userId:1, emailed:1, waitingForBatch:1, createdAt:-1, type:1});

Notifications.addView("unreadUserNotifications", (terms) => {
  return {
    selector: {
      userId: terms.userId,
      type: terms.type || null,
      createdAt: {$gte: terms.lastViewedDate}
    },
    options: {sort: {createdAt: -1}}
  }
})
ensureIndex(Notifications, {userId:1, type:1, createdAt:-1});

// Index used in callbacks for finding notifications related to a document
// that is being deleted
ensureIndex(Notifications, {documentId:1});
