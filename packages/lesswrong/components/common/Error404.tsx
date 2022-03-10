import { Components, registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import { useServerRequestStatus } from '../../lib/routeUtil'

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    ...theme.typography.postStyle,
  }
});

const Error404 = ({ classes }: {
  classes: ClassesType,
}) => {
  const { SingleColumnSection } = Components;
  const serverRequestStatus = useServerRequestStatus()
  if (serverRequestStatus) serverRequestStatus.status = 404
  
  return (
    <div className={classes.root}>
      <SingleColumnSection>
          <h2>404 Not Found</h2>
          <h3>Sorry, we couldn't find what you were looking for.</h3>
      </SingleColumnSection>
    </div>
  );
};

const Error404Component = registerComponent('Error404', Error404, { styles });

declare global {
  interface ComponentTypes {
    Error404: typeof Error404Component
  }
}
