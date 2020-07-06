import { registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    borderTop: "solid 1px rgba(0,0,0,.2)",
    padding: theme.spacing.unit*1.5,
    fontWeight: 600,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: 210
  }
})

const SunshineListTitle = ({children, classes}) => {
  return <Typography variant="body2" className={classes.root}>
    { children }
  </Typography>
};

const SunshineListTitleComponent = registerComponent('SunshineListTitle', SunshineListTitle, {styles});

declare global {
  interface ComponentTypes {
    SunshineListTitle: typeof SunshineListTitleComponent
  }
}

