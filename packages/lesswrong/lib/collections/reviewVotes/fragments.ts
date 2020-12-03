import { registerFragment } from '../../vulcan-lib';

registerFragment(`
  fragment reviewVoteFragment on ReviewVote {
    _id
    createdAt
    userId
    postId
    qualitativeScore
    quadraticScore
    comment
    year
    dummy
  }
`)
