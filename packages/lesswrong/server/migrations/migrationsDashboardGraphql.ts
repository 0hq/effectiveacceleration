import { defineQuery } from '../utils/serverGraphqlUtil';
import Migrations from '../../lib/collections/migrations/collection';
import { availableMigrations } from './migrationUtils';
import * as _ from 'underscore';
import moment from 'moment';

defineQuery({
  name: "MigrationsDashboard",
  resultType: "MigrationsDashboardData",
  schema: `
    type MigrationsDashboardData {
      migrations: [MigrationStatus!]
    }
    type MigrationStatus {
      name: String!
      dateWritten: String
      runs: [MigrationRun!]
      lastRun: String
    }
    type MigrationRun {
      name: String!
      started: Date!
      finished: Date
      succeeded: Boolean
    }`,
  fn: async (root, args, context) => {
    if (!context.currentUser || !context.currentUser.isAdmin)
      throw new Error("MigrationsDashboard graphQL API requires being logged in as an admin");
    
    const allMigrationRuns = Migrations.find({}).fetch();
    const runsByMigration = _.groupBy(allMigrationRuns, m=>m.name);
    
    const migrationNamesByDateWrittenDesc =
      _.sortBy(
        _.pairs(availableMigrations),
        ([name, {dateWritten}]) => dateWritten
      )
      .reverse()
      .map(([name, migration]) => name);
    
    return {
      migrations: migrationNamesByDateWrittenDesc
        .map(name => makeMigrationStatus(name, runsByMigration))
    };
  },
});

const makeMigrationStatus = (name, runsByMigration) => {
  const runs = runsByMigration[name]?.map(run => ({
    name: run.name,
    started: new Date(run.started),
    finished: run.finished ? new Date(run.finished) : null,
    succeeded: run.succeeded,
  })) || []

  let lastRun = ''
  if (runs.length) {
    const startDates = runs.map(run => run.started)
    lastRun = moment.utc(_.max(startDates)).format('YYYY-MM-DD')
  }

  const result = {
    name,
    dateWritten: availableMigrations[name].dateWritten,
    runs,
    lastRun,
  }
  return result
}
