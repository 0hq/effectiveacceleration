import { registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import PropTypes from 'prop-types'
import Input from '@material-ui/core/Input';
import { sequencesImageScrim } from '../sequences/SequencesPage'

const styles = theme => ({
  root: {
    marginTop: 65,
    backgroundColor: "rgba(0,0,0,0.25)",
    height: 380,
    [theme.breakpoints.down('sm')]: {
      marginTop: 40,
    }
  },
  imageScrim: {
    ...sequencesImageScrim(theme)
  },
  input: {
    position: 'relative',
    lineHeight: '1.1',
    left: -275,
    width: 650,
    fontSize: '36px',
    color: 'white',
    fontVariant: 'small-caps',
    zIndex: 2,
    height: '1em',
    resize: 'none',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    overflow: 'hidden',
    '&::placeholder': {
      color: 'rgba(255,255,255,.5)'
    }
  }
});

const EditSequenceTitle = ({classes, inputProperties, value, path, placeholder}, context) => {
  return <div className={classes.root}>
    <div className={classes.imageScrim}/>
    <div className="sequences-editor-title-wrapper">
      <Input
        className={classes.input}
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          context.updateCurrentValues({
            [path]: event.target.value
          })
        }}
        disableUnderline
      />
    </div>
  </div>
}

EditSequenceTitle.contextTypes = {
  updateCurrentValues: PropTypes.func,
};

const EditSequenceTitleComponent = registerComponent("EditSequenceTitle", EditSequenceTitle, {styles});

declare global {
  interface ComponentTypes {
    EditSequenceTitle: typeof EditSequenceTitleComponent
  }
}

