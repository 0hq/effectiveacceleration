import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { useVote } from '../votes/withVote';
import { hasVotedClient } from '../../lib/voting/vote';

const styles = theme => ({
  relevance: {
    marginTop: 2,
    marginLeft: 16,
    ...theme.typography.commentStyle,
  },
  relevanceLabel: {
    marginRight: 8,
    color: theme.palette.grey[600]
  },
  voteButton: {
    display: "inline-block",
    fontSize: 25,
  },
  score: {
    marginLeft: 4,
    marginRight: 4,
  },
  removeButton: {
    float: "right",
    marginTop: 12
  },
  removed: {
    float: "right",
    marginTop: 12,
    marginRight: 16,
    color: theme.palette.grey[400]
  }
});

const TagRelCard = ({tagRel, classes, relevance=true}: {
  tagRel: TagRelMinimumFragment,
  classes: ClassesType,
  relevance?: boolean
}) => {
  const voteProps = useVote(tagRel, "TagRels");
  const newlyVoted = !!(hasVotedClient({userVotes: voteProps.document.currentUserVotes, voteType: "smallUpvote"}) && voteProps.voteCount === 1)

  const { TagPreview, VoteButton, TagRelevanceButton, LWTooltip } = Components;
  
  return <div>
    <div className={classes.relevance}>
      <LWTooltip title="How relevant is this tag to this post?" placement="top">
        <span className={classes.relevanceLabel}>
          Relevance
        </span>
      </LWTooltip>
      <div className={classes.voteButton}>
        <VoteButton
          orientation="left"
          color="error"
          voteType="Downvote"
          {...voteProps}
        />
      </div>
      <span className={classes.score}>
        {voteProps.baseScore}
      </span>
      <div className={classes.voteButton}>
        <VoteButton
          orientation="right"
          color="secondary"
          voteType="Upvote"
          {...voteProps}
        />
      </div>
      {newlyVoted && <span className={classes.removeButton}>
        <LWTooltip title={"Remove your relevance vote from this tag"} placement="top">
          <TagRelevanceButton label="Remove Tag" {...voteProps} voteType="smallUpvote" cancelVote/>
        </LWTooltip>
      </span>}
      {voteProps.baseScore <= 0 && <span className={classes.removed}>Removed (refresh page)</span>}
    </div>
    <TagPreview tag={tagRel.tag}/>
  </div>
}

const TagRelCardComponent = registerComponent("TagRelCard", TagRelCard, {styles});

declare global {
  interface ComponentTypes {
    TagRelCard: typeof TagRelCardComponent
  }
}

