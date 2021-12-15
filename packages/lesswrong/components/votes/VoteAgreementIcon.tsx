import { registerComponent } from '../../lib/vulcan-lib';
import React, { useState } from 'react';
import classNames from 'classnames';
import UpArrowIcon from '@material-ui/icons/KeyboardArrowUp';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import Transition from 'react-transition-group/Transition';
import { withTheme } from '@material-ui/core/styles';

// const styles = (theme: ThemeType): JssStyles => ({
//   root: {
//     color: theme.palette.grey[400],
//     fontSize: 'inherit',
//     width: 'initial',
//     height: 'initial',
//     padding: 0,
//     '&:hover': {
//       backgroundColor: 'transparent',
//     }
//   },
//   smallArrow: {
//     fontSize: '50%',
//     opacity: 0.6
//   },
//   up: {},
//   right: {
//     transform: 'rotate(-270deg)',
//   },
//   down: {
//     transform: 'rotate(-180deg)',
//   },
//   left: {
//     transform: 'rotate(-90deg)',
//   },
//   bigArrow: {
//     position: 'absolute',
//     top: '-70%',
//     fontSize: '82%',
//     opacity: 0,
//     transition: `opacity ${theme.voting.strongVoteDelay}ms cubic-bezier(0.74, -0.01, 1, 1) 0ms`,
//   },
//   bigArrowSolid: {
//     fontSize: '65%',
//     top: "-45%"
//   },
//   bigArrowCompleted: {
//     fontSize: '90%',
//     top: '-75%',
//   },
//   // Classes for the animation transitions of the bigArrow. See Transition component
//   entering: {
//     opacity: 1
//   },
//   entered: {
//     opacity: 1
//   },
//   exiting: {
//     transition: 'opacity 150ms cubic-bezier(0.74, -0.01, 1, 1) 0ms',
//   }
// })

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    color: theme.palette.grey[400],
    fontSize: 'inherit',
    width: 'initial',
    height: 'initial',
    padding: 0,
    '&:hover': {
      backgroundColor: 'transparent',
    }
  },
  up: {},
  right: {
    transform: 'rotate(-270deg)',
  },
  down: {
    transform: 'rotate(-180deg)',
  },
  left: {
    transform: 'rotate(-90deg)',
  },
  bigCheck: {
    position: 'absolute',
    top: -3,
    left: 2,
    fontSize: '82%',
    opacity: 0,
    transition: `opacity ${theme.voting.strongVoteDelay}ms cubic-bezier(0.74, -0.01, 1, 1) 0ms`,
    height: 23
  },
  bigCheckSolid: {
    fontSize: '65%',
    top: "-45%"
  },
  bigCheckCompleted: {
    // fontSize: '90%',
    // top: '-75%',
    // left: 0
  },
  bigClear: {
    position: 'absolute',
    top: 1,
    left: 5,
    fontSize: '70%',
    opacity: 0,
    transition: `opacity ${theme.voting.strongVoteDelay}ms cubic-bezier(0.74, -0.01, 1, 1) 0ms`,
  },
  bigClearSolid: {
    fontSize: '65%',
    position: 'relative',
    top: "-45%"
  },
  bigClearCompleted: {
    fontSize: '80%',
    position: 'absolute',
    left: 4,
    top: 0,
  },
  hideIcon: {
    display: 'none'
  },
  check: {
    fontSize: '50%',
    opacity: 0.6,
    height: 15,
    position: 'absolute',
    top: 2,
    left: 3
  },
  clear: {
    fontSize: '45%',
    opacity: 0.6,
    position: 'absolute',
    top: 5,
    left: 11
  },
  smallCheckBigVoted: {
    fontSize: '50%',
    opacity: 0.6,
    position: 'absolute',
    top: -1,
    left: 4,
    height: 14
  },
  smallArrowBigVoted: {
    fontSize: '47%',
    opacity: 0.6,
    transform: 'rotate(-90deg)',
    position: 'absolute',
    height: 14,
    top: 3,
    left: 17
  },
  // Classes for the animation transitions of the bigArrow. See Transition component
  entering: {
    opacity: 1
  },
  entered: {
    opacity: 1
  },
  exiting: {
    transition: 'opacity 150ms cubic-bezier(0.74, -0.01, 1, 1) 0ms',
  },
  bigVoteIconStyling: { // necessary? unclear
    marginLeft: 0
  },
  iconsContainer: {
    position: 'relative',
    width: 25,
    height: 20
  },
  noClickCatch: {
    /* pointerEvents: none prevents elements under the IconButton from interfering with mouse
       events during a bigVote transition. */
    pointerEvents: 'none'
  }
})

export interface VoteArrowIconProps {
  solidArrow?: boolean,
  strongVoteDelay: number,
  orientation: "up"|"down"|"left"|"right",
  color: "error"|"primary"|"secondary",
  voted: boolean,
  eventHandlers: {
    handleMouseDown?: ()=>void,
    handleMouseUp?: ()=>void,
    handleClick?: ()=>void,
    clearState?: ()=>void,
  },
  bigVotingTransition: boolean,
  bigVoted: boolean,
  bigVoteCompleted: boolean,
  alwaysColored: boolean,
  theme?: ThemeType,
}

const VoteAgreementIcon = ({ solidArrow, strongVoteDelay, orientation, color, voted, eventHandlers, bigVotingTransition, bigVoted, bigVoteCompleted, alwaysColored, theme, classes }: VoteArrowIconProps & {
  classes: ClassesType
}) => {
  const upOrDown = orientation === "left" ? "Downvote" : "Upvote"
  
  const PrimaryIcon =  (upOrDown === "Downvote") ? ClearIcon : CheckIcon
  const primaryIconStyling = (upOrDown === "Downvote") ? classes.clear : classes.check
  
  const BigVoteAccentIcon = (upOrDown === "Downvote") ? UpArrowIcon: CheckIcon
  const bigVoteAccentStyling = (upOrDown === "Downvote") ? classes.smallArrowBigVoted : classes.smallCheckBigVoted
  const bigVoteCompletedStyling = (upOrDown === "Downvote") ? classes.bigClearCompleted : classes.bigCheckCompleted
  const bigVoteStyling = (upOrDown === "Downvote") ? classes.bigClear : classes.bigCheck
  
  return (
    <IconButton
      className={classNames(classes.root)}
      onMouseDown={eventHandlers.handleMouseDown}
      onMouseUp={eventHandlers.handleMouseUp}
      onMouseOut={eventHandlers.clearState}
      onClick={eventHandlers.handleClick}
      disableRipple
    >
      <span className={classes.iconsContainer}>
        <PrimaryIcon
          className={classNames(primaryIconStyling, classes.noClickCatch, {[classes.hideIcon]: bigVotingTransition || bigVoted})}
          color={voted ? color : 'inherit'}
          viewBox='6 6 12 12'
        />
        <Transition in={(bigVotingTransition || bigVoted)} timeout={theme.voting.strongVoteDelay}>
          {(state) => (
            <span className={classNames(classes.noClickCatch, classes.bigVoteIconStyling)}>
              <BigVoteAccentIcon
                className={classNames(bigVoteAccentStyling, classes.noClickCatch, {[classes.hideIcon]: !bigVoted})}
                color={voted ? color : 'inherit'}
                viewBox='6 6 12 12'
              />
              <PrimaryIcon
                style={bigVoteCompleted ? {color: theme.palette[color].light} : {}}
                className={classNames(bigVoteStyling, classes.noClickCatch, {
                  [bigVoteCompletedStyling]: bigVoteCompleted,
                  // [classes.bigCheckCompleted]: bigVoteCompleted,
                  [classes.bigCheckSolid]: solidArrow
                }, classes[state])}
                color={(bigVoted || bigVoteCompleted) ? color : 'inherit'}
                viewBox='6 6 12 12'
              />
            </span>)}
        </Transition>
      </span>
    </IconButton>
  )
}

const VoteAgreementIconComponent = registerComponent('VoteAgreementIcon', VoteAgreementIcon, {styles});

declare global {
  interface ComponentTypes {
    VoteAgreementIcon: typeof VoteAgreementIconComponent
  }
}




