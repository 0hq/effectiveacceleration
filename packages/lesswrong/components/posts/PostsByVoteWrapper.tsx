import React from 'react';
import { useMulti } from '../../lib/crud/withMulti';
import { registerComponent, Components } from '../../lib/vulcan-lib';

const PostsByVoteWrapper = ({voteType, year}: {voteType: string, year: number | '≤2020'}) => {
  const { PostsByVote, ErrorBoundary, Loading } = Components

  // const before = year === '≤2020' ? '2021-01-01' : `${year + 1}-01-01`
  const after = `${year}-01-01`

  const { results: votes, loading } = useMulti({
    terms: {
      view: "userPostVotes",
      collectionName: "Posts",
      voteType: voteType,
      // before,
      ...(year === '≤2020' ? {} : {after}),
    },
    collectionName: "Votes",
    fragmentName: "UserVotes",
    limit: 10000
  });

  if (loading) return <Loading/>
    
  const postIds = votes.map(vote=>vote.documentId)

  return <ErrorBoundary>
    <PostsByVote postIds={postIds} year={year}/>
  </ErrorBoundary>
}

const PostsByVoteWrapperComponent = registerComponent("PostsByVoteWrapper", PostsByVoteWrapper);

declare global {
  interface ComponentTypes {
    PostsByVoteWrapper: typeof PostsByVoteWrapperComponent
  }
}
