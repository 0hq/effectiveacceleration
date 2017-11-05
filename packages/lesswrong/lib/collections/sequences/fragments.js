import { registerFragment } from 'meteor/vulcan:core';

registerFragment(`
  fragment SequencesPageFragment on Sequence {
    _id
    createdAt
    userId
    user {
      ...UsersMinimumInfo
    }
    title
    description
    htmlDescription
    gridImageId
    bannerImageId
    color
    canonicalCollectionSlug
  }
`);

registerFragment(`
  fragment SequencesNavigationFragment on Sequence {
    _id
    createdAt
    title
    color
    canonicalCollectionSlug
    chapters {
      _id
      title
      number
      sequenceId
      posts {
        _id
        slug
        title
        lastVisitedAt
        excerpt
        baseScore
        score
        commentCount
        viewCount
        clickCount
      }
    }
  }
`);
