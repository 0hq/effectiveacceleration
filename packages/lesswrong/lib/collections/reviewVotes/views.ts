import ReviewVotes from "./collection"
import { ensureIndex } from '../../collectionUtils';

//Messages for a specific conversation
ReviewVotes.addView("reviewVotesFromUser", function ({userId}) {
  return {
    selector: {userId}
  };
});
ensureIndex(ReviewVotes, {deleted: 1, userId: 1});

ReviewVotes.addView("reviewVotesForPost", function ({postId}) {
  return {
    selector: {postId},
  };
});
ensureIndex(ReviewVotes, {deleted: 1, postId: 1});

ReviewVotes.addView("reviewVotesForPostAndUser", function ({postId, userId}) {
  return {
    selector: {postId, userId},
  };
});
ensureIndex(ReviewVotes, {deleted: 1, postId: 1, userId: 1})
