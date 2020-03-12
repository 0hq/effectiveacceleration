import React from 'react';
import { Components, registerComponent } from '../../../lib/vulcan-lib';
import Users from '../../../lib/collections/users/collection';
import { useCurrentUser } from '../../common/withUser';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { rowStyles } from './MigrationsDashboardRow';

const styles = theme => ({
  ...rowStyles,
  row: {
    display: 'flex',
    fontWeight: 'bold',
    fontSize: 17,
    borderBottom: '2px solid black',
    marginBottom: theme.spacing.unit / 2,
  }
});

const migrationsQuery = gql`
  query MigrationsDashboardQuery {
    MigrationsDashboard {
      migrations {
        name
        dateWritten
        runs { name started finished succeeded }
        lastRun
      }
    }
  }
`;

const MigrationsDashboard = ({classes}: {
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const { SingleColumnSection, Loading, SectionTitle } = Components;
  const { data, loading } = useQuery(migrationsQuery, { ssr: true });
  
  if (!Users.isAdmin(currentUser)) {
    return <SingleColumnSection>Sorry, you need to be logged in as an admin to use this page.</SingleColumnSection>;
  }
  
  return <SingleColumnSection>
    <SectionTitle title="Migrations" />
    {loading && <Loading/>}
    <div className={classes.row}>
      <span className={classes.name}>Name</span>
      <span className={classes.middleColumn}>Date Written</span>
      <span className={classes.middleColumn}>Status</span>
      <span className={classes.lastRun}>Last Run (Started)</span>
    </div>
    {data?.MigrationsDashboard?.migrations && data.MigrationsDashboard.migrations.map(migration =>
      <Components.MigrationsDashboardRow key={migration.name} migration={migration}/>)}
  </SingleColumnSection>;
}

const MigrationsDashboardComponent = registerComponent(
  "MigrationsDashboard", MigrationsDashboard, {styles}
);

declare global {
  interface ComponentTypes {
    MigrationsDashboard: typeof MigrationsDashboardComponent
  }
}
