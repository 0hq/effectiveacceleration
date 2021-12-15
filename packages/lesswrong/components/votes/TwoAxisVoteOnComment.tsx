import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { CommentVotingComponentProps } from '../../lib/voting/votingSystems';
import { useVote } from './withVote';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
  },
  agreementSection: {
    display: "inline-block",
    fontSize: 25,
    marginLeft: 16,
    lineHeight: 0.6,
  },
  agreementScore: {
    fontSize: "1.1rem",
    marginLeft: 4,
    lineHeight: 1,
    marginRight: 4,
  },
});

interface TwoAxisVoteOnCommentProps extends CommentVotingComponentProps {
  classes: ClassesType
}

const TwoAxisVoteOnComment = ({document, hideKarma=false, collection, votingSystem, classes}: TwoAxisVoteOnCommentProps) => {
  const voteProps = useVote(document, collection.options.collectionName, votingSystem);
  const { VoteAxis, AxisVoteButton, LWTooltip } = Components;
  
  return <span className={classes.root}>
    <VoteAxis
      document={document}
      hideKarma={hideKarma}
      voteProps={voteProps}
    />
    
    <span className={classes.agreementSection}>
      <AxisVoteButton
        VoteArrowComponent={Components.VoteAgreement}
        axis="agreement"
        orientation="left" color="error" upOrDown="Downvote"
        {...voteProps}
      />
      
      <span className={classes.agreementScore}>
        <LWTooltip title={`${(voteProps?.document?.extendedScore?.agreementVoteCount||0)} agreement votes`}>
          {voteProps?.document?.extendedScore?.agreement || 0}
        </LWTooltip>
      </span>
      
      <AxisVoteButton
        VoteArrowComponent={Components.VoteAgreement}
        axis="agreement"
        orientation="right" color="secondary" upOrDown="Upvote"
        {...voteProps}
      />
    </span>
  </span>
}


const TwoAxisVoteOnCommentComponent = registerComponent('TwoAxisVoteOnComment', TwoAxisVoteOnComment, {styles});

declare global {
  interface ComponentTypes {
    TwoAxisVoteOnComment: typeof TwoAxisVoteOnCommentComponent
  }
}
