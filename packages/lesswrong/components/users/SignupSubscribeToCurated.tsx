import React, { useState } from 'react';
import { registerComponent } from '../../lib/vulcan-lib';
import Checkbox from '@material-ui/core/Checkbox';
import Info from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    ...theme.typography.body2,
    marginBottom: 10,
  },
  checkbox: {
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 6,
  },
  infoIcon: {
    width: 16,
    height: 16,
    verticalAlign: "middle",
    color: "rgba(0,0,0,.4)",
    marginLeft: 6,
  },
});

const SignupSubscribeToCurated = ({ defaultValue, onChange, id, classes }) => {
  const [checked, setChecked] = useState(defaultValue);
  return <div key={id} className={classes.root}>
    <Checkbox
      checked={checked}
      className={classes.checkbox}
      onChange={(ev, newChecked) => {
        setChecked(newChecked)
        onChange({target: {value: newChecked}})
      }}
    />
    Subscribe to Curated posts
    <Tooltip title="Emails 2-3 times per week with the best posts, chosen by the LessWrong moderation team.">
      <Info className={classes.infoIcon}/>
    </Tooltip>
  </div>
}

const SignupSubscribeToCuratedComponent = registerComponent('SignupSubscribeToCurated', SignupSubscribeToCurated, {styles});

declare global {
  interface ComponentTypes {
    SignupSubscribeToCurated: typeof SignupSubscribeToCuratedComponent
  }
}
