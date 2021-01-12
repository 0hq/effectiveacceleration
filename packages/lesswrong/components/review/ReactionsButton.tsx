import React, { useState } from 'react';
import { registerComponent } from '../../lib/vulcan-lib/components';
import type { vote } from './ReviewVotingPage';
import classNames from 'classnames';
import * as _ from "underscore"
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';

const styles = (theme: ThemeType) => ({
  root: {
    ...theme.typography.commentStyle,
    padding: '5px  8px',
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
    marginLeft: 4,
    marginBottom: 4,
    border: 'solid 1px rgba(72,94,144,0.16)',
    cursor: 'pointer',
    display: 'inline-block',
    '&:hover': {
      backgroundColor: 'rgba(240,240,240,1)'
    }
  },
  active: {
    color: 'white',
    backgroundColor: theme.palette.primary.dark,
    '&:hover': {
      backgroundColor: theme.palette.primary.main
    }
  },
  textEntryOpen: {
    padding: 0,
    paddingLeft: 4
  }
})


const ReactionsButton = ({classes, postId, vote, votes, reaction, freeEntry }: {classes: ClassesType, postId: string, vote: any, votes: vote[], reaction: string, freeEntry: boolean}) => {
  const voteForCurrentPost = votes.find(vote => vote.postId === postId)
  const currentReactions = voteForCurrentPost?.reactions || []
  const [freeEntryText, setFreeEntryText] = useState("")
  const [textFieldOpen, setTextFieldOpen] = useState(false)
  const createClickHandler = (postId: string, reactions: string[], voteId: string | undefined, score: number | undefined) => {
    if (freeEntry) {
      return () => {
        setTextFieldOpen(true)
      }
    } else {
      return () => {
        vote({postId, reactions, _id: voteId, previousValue: score})
      }
    }
  }

  const submitFreeEntryText = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (freeEntryText.length > 0) {
      vote({postId, reactions: [...currentReactions, freeEntryText], _id: voteForCurrentPost?._id, previousValue: voteForCurrentPost?.score})
    }
    setTextFieldOpen(false)
    setFreeEntryText("")
  }
  
  const handleEnter = e => {
    if (e.keyCode == 13) {
      submitFreeEntryText(e)
    }
  }

  return <span 
    className={classNames(classes.root, {[classes.active]: currentReactions.includes(reaction), [classes.textEntryOpen]: textFieldOpen })}
    onClick={createClickHandler(postId, currentReactions.includes(reaction) ? _.without(currentReactions, reaction) : [...currentReactions, reaction], voteForCurrentPost?._id, voteForCurrentPost?.score)}
  >
    {textFieldOpen ? <Input
      placeholder={reaction}
      value={freeEntryText}
      onChange={(event) => {
        setFreeEntryText(event.target.value)
      }}
      disableUnderline={true}
      onKeyDown={handleEnter}
      onBlur={e => submitFreeEntryText(e)}
      
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            aria-label="Toggle password visibility"
            onClick={submitFreeEntryText}
          >
            <CheckIcon />
          </IconButton>
        </InputAdornment>
      }
      autoFocus
    /> : <span>{reaction}</span>}
  </span>
}

const ReactionsButtonComponent = registerComponent("ReactionsButton", ReactionsButton, {styles});

declare global {
  interface ComponentTypes {
    ReactionsButton: typeof ReactionsButtonComponent
  }
}
