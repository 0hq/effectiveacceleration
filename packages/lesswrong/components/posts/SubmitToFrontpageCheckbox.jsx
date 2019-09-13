import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import { registerComponent } from 'meteor/vulcan:core';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  submitToFrontpageWrapper: {
    [theme.breakpoints.down('sm')]: {
      width: "100%",
      order:1
    }
  },
  submitToFrontpage: {
    display: "flex",
    alignItems: "center",
    maxWidth: 300,
    [theme.breakpoints.down('sm')]: {
      width: "100%",
      maxWidth: "none",
      justifyContent: "flex-end",
      paddingRight: theme.spacing.unit*3,
    }
  },
  checkboxLabel: {
    fontWeight:500,
    fontFamily: theme.typography.commentStyle.fontFamily,
    fontSize: 16,
    color: "rgba(0,0,0,0.4)",
    verticalAlign: 'middle'
  },
  tooltip: {
    '& ul': {
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: theme.spacing.unit/2,
      paddingLeft: theme.spacing.unit*3,
    },
    '& p': {
      marginTop: theme.spacing.unit/2,
      marginBottom: theme.spacing.unit/2
    }
  },
  guidelines: {
    fontStyle: "italic"
  },
});

class SubmitToFrontpageCheckbox extends Component {
  handleClick = () => {
    const { fieldName = "submitToFrontpage" } = this.props
    const { updateCurrentValues } = this.context
    updateCurrentValues({[fieldName]: !this.getCurrentValue()})
  }
  
  getCurrentValue = () => {
    const { currentValues, document, fieldName = "submitToFrontpage" } = this.props
    let value = true
    if (fieldName in currentValues) {
      value = currentValues[fieldName]
    } else if (fieldName in document) {
      value = document[fieldName]
    }
    return value
  }

  render() {
    const { classes, label="Moderators may promote", tooltip } = this.props

    const displayedTooltip = tooltip || <div className={classes.tooltip}>
      <p>LW moderators will consider this post for frontpage</p>
      <p className={classes.guidelines}>Things to aim for:</p>
      <ul>
        <li className={classes.guidelines}>
          Usefulness, novelty and fun
        </li>
        <li className={classes.guidelines}>
          Timeless content (minimize reference to current events)
        </li>
        <li className={classes.guidelines}>
          Explain rather than persuade
        </li>
      </ul>
    </div>

    return <div className={classes.submitToFrontpageWrapper}>
      <Tooltip title={displayedTooltip}>
        <div className={classes.submitToFrontpage}>
          <div>
            <Checkbox checked={this.getCurrentValue()} onClick={this.handleClick}/>
            <span className={classes.checkboxLabel}>{label}</span>
          </div>
        </div>
      </Tooltip>
    </div>
  }
} 

SubmitToFrontpageCheckbox.contextTypes = {
  updateCurrentValues: PropTypes.func,
}


registerComponent('SubmitToFrontpageCheckbox', SubmitToFrontpageCheckbox,
  withStyles(styles, { name: "SubmitToFrontpageCheckbox" })
);
