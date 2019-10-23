import { registerFragment } from 'meteor/vulcan:core';

registerFragment(`
  fragment TagRelFragment on TagRel {
    _id
    baseScore
    afBaseScore
    userId
    tag {
      _id
      name
      slug
    }
    post {
      ...PostsList
    }
    currentUserVotes {
      ...VoteFragment
    }
  }
`);

registerFragment(`
  fragment TagRelMinimumFragment on TagRel {
    _id
    baseScore
    afBaseScore
    userId
    tag {
      _id
      name
      slug
    }
    currentUserVotes {
      ...VoteFragment
    }
  }
`);

registerFragment(`
  fragment WithVoteTagRel on TagRel {
    __typename
    _id
    userId
    tag {
      _id
      name
      slug
    }
    currentUserVotes {
      _id
      voteType
      power
    }
    baseScore
    afBaseScore
    score
    voteCount
  }
`);
