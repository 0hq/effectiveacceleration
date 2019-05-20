import Votes from './collections/votes/collection.js';
import moment from 'moment-timezone';
import htmlToText from 'html-to-text';
import sumBy from 'lodash/sumBy';

const COMMENT_DESCRIPTION_LENGTH = 500;

// This file is mostly server-side, but lives in an included-with-client-bundle
// directory because we don't have a good way to make resolvers, or imports
// used by resolvers, be server specific.


// Given a user and a date range, get a summary of karma changes that occurred
// during that date range.
//
// For example:
// {
//   totalChange: 10,
//   startDate: Date("2018-09-09"),
//   endDate: Date("2018-09-10"),
//   documents: [
//     {
//       _id: "12345",
//       collectionName: "Posts",
//       scoreChange: 3,
//     },
//     {
//       _id: "12345",
//       collectionName: "Comments",
//       scoreChange: -1,
//     },
//   ]
// }
export async function getKarmaChanges({user, startDate, endDate, nextBatchDate, af=false})
{
  if (!user) throw new Error("Missing required argument: user");
  if (!startDate) throw new Error("Missing required argument: startDate");
  if (!endDate) throw new Error("Missing required argument: endDate");
  if (startDate > endDate)
    throw new Error("getKarmaChanges: endDate must be after startDate");

  const showNegativeKarmaSetting = user.karmaChangeNotifierSettings?.showNegativeKarma
  
  function karmaChangesInCollectionPipeline(collectionName) {
    return [
      // Get votes cast on this user's content (including cancelled votes)
      {$match: {
        authorId: user._id,
        votedAt: {$gte: startDate, $lte: endDate},
        userId: {$ne: user._id}, //Exclude self-votes
        collectionName: collectionName,
        ...(af && {afPower: {$exists: true}})
      }},
      
      // Group by thing-that-was-voted-on and calculate the total karma change
      {$group: {
        _id: "$documentId",
        collectionName: { $first: "$collectionName" },
        scoreChange: { $sum: af ? "$afPower" : "$power" },
      }},
      
      // Filter out things with zero or negative net change (eg where someone voted and then
      // unvoted and nothing else happened)
      // User setting determines whether we show negative changes
      {$match: {
        scoreChange: showNegativeKarmaSetting ? {$ne: 0} : {$gt: 0}
      }}
    ];
  }
  
  let changedComments = await Votes.rawCollection().aggregate(
    [
      ...karmaChangesInCollectionPipeline("Comments"),
      
      {$lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "_id",
        as: "comment"
      }},
      {$project: {
        _id:1,
        scoreChange:1,
        description: {$arrayElemAt: ["$comment.contents.html",0]},
        postId: {$arrayElemAt: ["$comment.postId",0]},
      }},
    ]
  ).toArray()
  
  let changedPosts = await Votes.rawCollection().aggregate(
    [
      ...karmaChangesInCollectionPipeline("Posts"),
      
      {$lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "_id",
        as: "post"
      }},
      {$project: {
        _id:1,
        scoreChange:1,
        title: {$arrayElemAt: ["$post.title",0]},
        slug: {$arrayElemAt: ["$post.slug",0]},
      }},
    ]
  ).toArray();
  
  // Replace comment bodies with abbreviated plain-text versions (rather than
  // HTML).
  for (let comment of changedComments) {
    comment.description = htmlToText.fromString(comment.description)
      .substring(0, COMMENT_DESCRIPTION_LENGTH);
  }
  
  let totalChange = sumBy(changedPosts, doc=>doc.scoreChange) + sumBy(changedComments, doc=>doc.scoreChange);
  
  return {
    totalChange,
    startDate,
    nextBatchDate,
    endDate,
    posts: changedPosts,
    comments: changedComments,
  };
}

export function getKarmaChangeDateRange({settings, now, lastOpened=null, lastBatchStart=null})
{
  // Greatest date prior to lastOpened at which the time of day matches
  // settings.timeOfDay.
  let todaysDailyReset = moment(now).tz("GMT");
  todaysDailyReset.set('hour', Math.floor(settings.timeOfDayGMT));
  todaysDailyReset.set('minute', 60*(settings.timeOfDayGMT%1));
  todaysDailyReset.set('second', 0);
  todaysDailyReset.set('millisecond', 0);
  
  const lastDailyReset = todaysDailyReset.isAfter(now)
    ? moment(todaysDailyReset).subtract(1, 'days')
    : todaysDailyReset;

  const previousBatchExists = !!lastBatchStart
  
  switch(settings.updateFrequency) {
    case "disabled":
      return null;
    case "daily": {
      const oneDayPrior = moment(lastDailyReset).subtract(1, 'days')
      
      // Check whether the last time you opened the menu was in the same batch-period
      const openedBeforeNextBatch = lastOpened && lastOpened >= lastDailyReset.toDate()

      // If you open the notification menu again before the next batch has started, just return
      // the previous batch
      if (previousBatchExists && openedBeforeNextBatch) {
        // Since we know that we reopened the notifications before the next batch, the last batch
        // will have ended at the last daily reset time
        const lastBatchEnd = lastDailyReset
        // Sanity check in case lastBatchStart is invalid (eg not cleared after a settings change)
        if (lastBatchStart < lastBatchEnd.toDate()) {
          return {
            start: lastBatchStart,
            end: lastBatchEnd.toDate()
          };
        }
      }

      // If you've never opened the menu before, then return the last daily batch, else
      // create batch for all periods that happened since you last opened it
      const startDate = lastOpened ? moment.min(oneDayPrior, moment(lastOpened)) : oneDayPrior
      return {
        start: startDate.toDate(),
        end: lastDailyReset.toDate(),
      };
    }
    case "weekly": {
      // Target day of the week, as an integer 0-6
      const targetDayOfWeekNum = moment().day(settings.dayOfWeekGMT).day();
      const lastDailyResetDayOfWeekNum = lastDailyReset.day();
      
      // Number of days back from today's daily reset to get to a daily reset
      // of the correct day of the week
      const daysOfWeekDifference = ((lastDailyResetDayOfWeekNum - targetDayOfWeekNum) + 7) % 7;
      
      const lastWeeklyReset = moment(lastDailyReset).subtract(daysOfWeekDifference, 'days');
      const oneWeekPrior = moment(lastWeeklyReset).subtract(7, 'days');

      // Check whether the last time you opened the menu was in the same batch-period
      const openedBeforeNextBatch = lastOpened && lastOpened >= lastWeeklyReset.toDate()

      // If you open the notification menu again before the next batch has started, just return
      // the previous batch
      if (previousBatchExists && openedBeforeNextBatch) {
        // Since we know that we reopened the notifications before the next batch, the last batch
        // will have ended at the last daily reset time
        const lastBatchEnd = lastWeeklyReset
        // Sanity check in case lastBatchStart is invalid (eg not cleared after a settings change)
        if (lastBatchStart < lastBatchEnd.toDate()) {
          return {
            start: lastBatchStart,
            end: lastBatchEnd.toDate()
          };
        }
      }

      // If you've never opened the menu before, then return the last daily batch, else
      // create batch for all periods that happened since you last opened it
      const startDate = lastOpened ? moment.min(oneWeekPrior, moment(lastOpened)) : oneWeekPrior
      return {
        start: startDate.toDate(),
        end: lastWeeklyReset.toDate(),
      };
    }
    case "realtime":
      if (!lastOpened) {
        // If set to realtime and never opened before (eg, you just changed the
        // setting), default to the last 24 hours.
        return {
          start: moment().subtract(1, 'days').toDate(),
          end: now
        }
      } else {
        return {
          start: lastOpened,
          end: now
        }
      }
  }
}

export function getKarmaChangeNextBatchDate({settings, now})
{
  switch(settings.updateFrequency) {
    case "disabled":
    case "realtime":
      return null;
    case "daily":
      const lastDailyBatch = getKarmaChangeDateRange({settings, now});
      const lastDailyReset = lastDailyBatch.end;
      const nextDailyReset = moment(lastDailyReset).add(1, 'days');
      return nextDailyReset.toDate();
      
    case "weekly":
      const lastWeeklyBatch = getKarmaChangeDateRange({settings, now});
      const lastWeeklyReset = lastWeeklyBatch.end;
      const nextWeeklyReset = moment(lastWeeklyReset).add(7, 'days');
      return nextWeeklyReset.toDate();
  }
}
