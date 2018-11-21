import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { registerComponent, Components } from 'meteor/vulcan:core';
import TextField from '@material-ui/core/TextField';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  labelColor: {
    color: theme.secondary
  },
  textField: {
    fontSize: "15px",
    width: 350,
    [theme.breakpoints.down('md')]: {
      width: "100%",
    },
  },
  fullWidth: {
    width:"100%",
  }
})

class MuiTextField extends PureComponent {
  constructor(props, context) {
    super(props,context);
  }

  onChange = (event) => {
    this.context.updateCurrentValues({
      [this.props.path]: event.target.value
    })
  }

  render() {
    const { classes, value, select, children, label, multiLine, rows, fullWidth, type, defaultValue, InputLabelProps } = this.props

    return <TextField
        select={select}
        value={value||""}
        defaultValue={defaultValue}
        label={label}
        onChange={this.onChange}
        multiline={multiLine}
        rows={rows}
        type={type}
        fullWidth={fullWidth}
        InputLabelProps={{
          className: classes.cssLabel,
          ...InputLabelProps
        }}
        classes={{input: classes.input}}
        className={classnames(
          classes.textField,
          {fullWidth:fullWidth}
        )}
      >
        {children}
      </TextField>
  }
}

MuiTextField.contextTypes = {
  updateCurrentValues: PropTypes.func,
};

registerComponent("MuiTextField", MuiTextField, withStyles(styles, { name: "MuiTextField" }));
