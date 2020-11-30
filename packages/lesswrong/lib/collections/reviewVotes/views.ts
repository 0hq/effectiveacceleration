import ReviewVotes from "./collection"
import { ensureIndex } from '../../collectionUtils';

declare global {
  interface ReviewVotesViewTerms extends ViewTermsBase {
    view: ReviewVotesViewName
    postId?: string
    userId?: string
  }
}


//Messages for a specific conversation
ReviewVotes.addView("reviewVotesFromUser", function ({userId}: ReviewVotesViewTerms) {
  return {
    selector: {userId}
  };
});
ensureIndex(ReviewVotes, {deleted: 1, userId: 1});

ReviewVotes.addView("reviewVotesForPost", function ({postId}: ReviewVotesViewTerms) {
  return {
    selector: {postId},
  };
});
ensureIndex(ReviewVotes, {deleted: 1, postId: 1});

ReviewVotes.addView("reviewVotesForPostAndUser", function ({postId, userId}: ReviewVotesViewTerms) {
  return {
    selector: {postId, userId},
  };
});
ensureIndex(ReviewVotes, {deleted: 1, postId: 1, userId: 1})
