import ReviewVotes from "./collection"
import { ensureIndex } from '../../collectionUtils';

declare global {
  interface ReviewVotesViewTerms extends ViewTermsBase {
    view?: ReviewVotesViewName
    postId?: string
    userId?: string
    year?: string,
  }
}


//Messages for a specific conversation
ReviewVotes.addView("reviewVotesFromUser", (terms: ReviewVotesViewTerms) => {
  return {
    selector: {
      userId: terms.userId,
      year: terms.year,
      dummy: false
    }
  };
});
ensureIndex(ReviewVotes, {year: 1, deleted: 1, userId: 1, dummy: 1});

ReviewVotes.addView("reviewVotesForPost", function ({postId}: ReviewVotesViewTerms) {
  return {
    selector: {postId},
  };
});
ensureIndex(ReviewVotes, {deleted: 1, postId: 1});

ReviewVotes.addView("reviewVotesForPostAndUser", function ({postId, userId}: ReviewVotesViewTerms) {
  return {
    selector: {postId, userId}
  };
});
ensureIndex(ReviewVotes, {deleted: 1, postId: 1, userId: 1})

ReviewVotes.addView("reviewVotesAdminDashboard", function ({year}: ReviewVotesViewTerms) {
  return {
    selector: {
      year: year,
      dummy: false
    },
    options: {
      sort: {
        createdAt: -1
      }
    }
  }
})
ensureIndex(ReviewVotes, {year: 1, deleted: 1, dummy: 1, createdAt: -1});
