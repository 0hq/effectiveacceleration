import { forEachBucketRangeInCollection, registerMigration } from './migrationUtils';
import { recomputeDenormalizedValues } from '../scripts/recomputeDenormalized';
import ReviewVotes from '../../lib/collections/reviewVotes/collection';
import { REVIEW_YEAR } from '../../lib/reviewUtils';
import groupBy from 'lodash/groupBy';
import { Posts } from '../../lib/collections/posts';
import Users from '../../lib/collections/users/collection';


const voteMap = {
  1: { 
    cost: 45,
    value: -9 
  },
  2: { 
    cost: 10,
    value: -4 
  },
  3: { 
    cost: 1,
    value: -1 
  },
  4: { 
    cost: 0,
    value: 0 
  },
  5: { 
    cost: 1,
    value: 1 
  },
  6: { 
    cost: 10,
    value: 4 
  },
  7: { 
    cost: 45,
    value: 9 
  },
}

const getCost = (vote) => voteMap[vote.qualitativeScore].cost
const getValue = (vote) => voteMap[vote.qualitativeScore].value

// TODO: Write a better version of this migration which properly normalizes vote strength
registerMigration({
  name: "updateQuadraticVotes",
  dateWritten: "2021-12-02",
  idempotent: true,
  action: async () => {
    const votes = await ReviewVotes.find({year: REVIEW_YEAR+""}).fetch()
    const votesByUserId = groupBy(votes, vote => vote.userId)
    const users = await Users.find({_id: {$in: Object.keys(votesByUserId)}}).fetch()
    const usersByUserId = groupBy(users, user => user._id)

    let postsAllUsers = {}
    let postsHighKarmaUsers = {}
    let postsAFUsers = {}

    function updatePost(postList, vote) {
      if (postList[vote.postId] === undefined) { 
        postList[vote.postId] = [getValue(vote)]
      } else {
        postList[vote.postId].push(getValue(vote))
      }
    }

    Object.keys(votesByUserId).forEach(async (userId) => {
      let totalUserPoints = 0 
      const user = usersByUserId[userId][0]

      votesByUserId[userId].forEach(async vote => {
        totalUserPoints += getCost(vote)
        await ReviewVotes.update({_id:vote._id}, {$set: {quadraticVote: getValue(vote)}})
        
        updatePost(postsAllUsers, vote)
        if (user.karma >= 1000) {
          updatePost(postsHighKarmaUsers, vote)
        }
        if (user.groups?.includes('alignmentForum')) {
          updatePost(postsAFUsers, vote)
        }
      })
      // eslint-disable-next-line no-console
      console.log(userId, totalUserPoints, totalUserPoints > 500 ? "Over 500" : "")
    })

    Object.keys(postsAllUsers).forEach(async postId => {
      await Posts.update({_id:postId}, {$set: { 
        reviewVotesAllKarma: postsAllUsers[postId].sort((a,b) => b - a), 
        reviewVoteScoreAllKarma: postsAllUsers[postId].reduce((x, y) => x + y, 0) 
      }})
    })
    Object.keys(postsHighKarmaUsers).forEach(async postId => {
      await Posts.update({_id:postId}, {$set: { 
        reviewVotesHighKarma: postsHighKarmaUsers[postId].sort((a,b) => b - a),
        reviewVoteScoreHighKarma: postsHighKarmaUsers[postId].reduce((x, y) => x + y, 0),
      }})
    })
    Object.keys(postsAFUsers).forEach(async postId => {
      await Posts.update({_id:postId}, {$set: { 
        reviewVotesAF: postsAFUsers[postId].sort((a,b) => b - a),
        reviewVoteScoreAF: postsAFUsers[postId].reduce((x, y) => x + y, 0),
       }})
    })
  },
});

