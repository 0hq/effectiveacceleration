import { registerFragment } from '../../vulcan-lib';



registerFragment(`
  fragment PostsMinimumInfo on Post {
    _id
    slug
    title
    draft
    hideCommentKarma
    af
  }
`);

registerFragment(`
  fragment PostsBase on Post {
    ...PostsMinimumInfo
    
    # Core fields
    url
    postedAt
    createdAt
    modifiedAt
    sticky
    metaSticky
    status
    frontpageDate
    meta
    draft
    deletedDraft
    viewCount
    clickCount
    
    commentCount
    voteCount
    baseScore
    unlisted
    score
    feedId
    feedLink
    lastVisitedAt
    isRead
    lastCommentedAt
    lastCommentPromotedAt
    canonicalCollectionSlug
    curatedDate
    commentsLocked

    # questions
    question
    hiddenRelatedQuestion
    originalPostRelationSourceId

    # vulcan:users
    userId
    
    # Local Event data
    groupId
    location
    googleLocation
    mongoLocation
    startTime
    endTime
    localStartTime
    localEndTime
    facebookLink
    website
    contactInfo
    isEvent
    types

    # Review data 
    reviewedByUserId
    suggestForCuratedUserIds
    suggestForCuratedUsernames
    reviewForCuratedUserId
    authorIsUnreviewed

    # Alignment Forum
    afDate
    suggestForAlignmentUserIds
    reviewForAlignmentUserId
    afBaseScore
    afCommentCount
    afLastCommentedAt
    afSticky
    
    isFuture
    hideAuthor
    moderationStyle
    hideCommentKarma
    submitToFrontpage
    shortform
    canonicalSource
    noIndex

    shareWithUsers
    
    nominationCount2018
    reviewCount2018

    group {
      _id
      name
    }
    bestAnswer {
      ...CommentsList
    }
  }
`);

registerFragment(`
  fragment PostsAuthors on Post {
    user {
      ...UsersMinimumInfo
      
      # Author moderation info
      moderationStyle
      bannedUserIds
      moderatorAssistance
    }
    coauthors {
      ...UsersMinimumInfo
    }
  }
`);

registerFragment(`
  fragment PostsList on Post {
    ...PostsBase
    ...PostsAuthors
    contents {
      htmlHighlight
      wordCount
      version
    }
    moderationGuidelines {
      ...RevisionDisplay
    }
    customHighlight {
      version
      html
    }
  }
`);

registerFragment(`
  fragment PostsListTag on Post {
    ...PostsList
    tagRel(tagId: $tagId) {
      ...WithVoteTagRel
    }
  }
`)

registerFragment(`
  fragment PostsDetails on Post {
    ...PostsBase
    ...PostsAuthors

    # Sort settings
    commentSortOrder
    
    # Sequence navigation
    collectionTitle
    canonicalPrevPostSlug
    canonicalNextPostSlug
    canonicalCollectionSlug
    canonicalSequenceId
    canonicalBookId
    canonicalSequence {
      title
    }
    canonicalBook {
      title
    }
    canonicalCollection {
      title
    }

    # Moderation stuff
    showModerationGuidelines
    moderationGuidelines {
      ...RevisionDisplay
    }
    customHighlight {
      version
      html
    }
    bannedUserIds
    hideAuthor
    moderationStyle
    
    # Voting
    voteCount
    currentUserVotes{
      ...VoteFragment
    }
    feed {
      ...RSSFeedMinimumInfo
    }
    sourcePostRelations {
      _id
      sourcePostId
      sourcePost {
        ...PostsBase
        ...PostsAuthors
      }
      order
    }
    targetPostRelations {
      _id
      sourcePostId
      targetPostId
      targetPost {
        ...PostsBase
        ...PostsAuthors
      }
      order
    }
  }
`);

// Same as PostsPage, with added just optional arguments to the content field
// and a list of revisions
registerFragment(`
  fragment PostsRevision on Post {
    ...PostsDetails

    # Content & Revisions
    version
    contents(version: $version) {
      ...RevisionDisplay
    }
    revisions {
      version
      editedAt
    }
  }
`)

registerFragment(`
  fragment PostsRevisionEdit on Post {
    ...PostsDetails

    # Content & Revisions
    version
    contents(version: $version) {
      ...RevisionEdit
    }
    revisions {
      version
      editedAt
    }
  }
`)

registerFragment(`
  fragment PostsWithNavigationAndRevision on Post {
    ...PostsRevision
    ...PostSequenceNavigation
    
    tableOfContentsRevision(version: $version)
  }
`)

registerFragment(`
  fragment PostsWithNavigation on Post {
    ...PostsPage
    ...PostSequenceNavigation
    
    tableOfContents
  }
`)

// This is a union of the fields needed by PostsTopNavigation and BottomNavigation.
registerFragment(`
  fragment PostSequenceNavigation on Post {
    # Prev/next sequence navigation
    sequence(sequenceId: $sequenceId) {
      _id
      title
    }
    prevPost(sequenceId: $sequenceId) {
      _id
      title
      slug
      commentCount
      baseScore
      sequence(sequenceId: $sequenceId) {
        _id
      }
    }
    nextPost(sequenceId: $sequenceId) {
      _id
      title
      slug
      commentCount
      baseScore
      sequence(sequenceId: $sequenceId) {
        _id
      }
    }
  }
`)

registerFragment(`
  fragment PostsPage on Post {
    ...PostsDetails
    version
    contents {
      ...RevisionDisplay
    }
  }
`)

registerFragment(`
  fragment PostsEdit on Post {
    ...PostsPage
    moderationGuidelines {
      ...RevisionEdit
    }
    contents {
      ...RevisionEdit
    }
    customHighlight {
      ...RevisionEdit
    }
    tableOfContents
  }
`);

registerFragment(`
  fragment EditModerationGuidelines on Post {
    moderationGuidelines {
      ...RevisionEdit
    },
    moderationStyle
  }
`)

registerFragment(`
  fragment PostsRevisionsList on Post {
    _id
    revisions {
      version
      editedAt
    }
  }
`)


registerFragment(`
  fragment PostsRecentDiscussion on Post {
    ...PostsList
    recentComments(commentsLimit: $commentsLimit, maxAgeHours: $maxAgeHours, af: $af) {
      ...CommentsList
    }
  }
`);

registerFragment(`
  fragment UsersBannedFromPostsModerationLog on Post {
    user {
      ...UsersMinimumInfo
    }
    title
    slug
    _id
    bannedUserIds
  }
`)

registerFragment(`
  fragment SunshinePostsList on Post {
    ...PostsList
    
    user {
      ...UsersMinimumInfo
      
      # Author moderation info
      moderationStyle
      bannedUserIds
      moderatorAssistance
      
      moderationGuidelines {
        html
      }
    }
  }
`)
