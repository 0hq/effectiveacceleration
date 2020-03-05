import React from 'react';
import { registerComponent } from '../../lib/vulcan-lib';
import classNames from 'classnames';
import Settings from '@material-ui/icons/Settings';

const styles = (theme) => ({
  icon: {
    cursor: "pointer",
    color: theme.palette.grey[400],
  },
  iconWithLabelGroup: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer"
  },
  iconWithLabel: {
    marginRight: theme.spacing.unit,
  },
  label: {
    ...theme.typography.body2,
    fontSize: 14,
    color: theme.palette.grey[600],
    fontStyle: "italic"
  }
})

const SettingsIcon = ({classes, className, onClick, label=""}: {
  classes: ClassesType,
  className?: string,
  onClick?: any,
  label?: string,
}) => {
  if (label) {
    return <span className={classes.iconWithLabelGroup} onClick={onClick}>
      <Settings className={classNames(classes.icon, classes.iconWithLabel, className)}/> 
      <span className={classes.label}>{ label }</span>
    </span>
  }
  return <Settings className={classNames(classes.icon, className)} onClick={onClick}/>
}

const SettingsIconComponent = registerComponent('SettingsIcon', SettingsIcon, {styles});

declare global {
  interface ComponentTypes {
    SettingsIcon: typeof SettingsIconComponent
  }
}
