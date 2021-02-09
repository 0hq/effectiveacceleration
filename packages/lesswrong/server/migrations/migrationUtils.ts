import Migrations from '../../lib/collections/migrations/collection';
import { Vulcan } from '../../lib/vulcan-lib';
import * as _ from 'underscore';
import { getSchema } from '../../lib/utils/getSchema';

// When running migrations with split batches, the fraction of time spent
// running those batches (as opposed to sleeping). Used to limit database
// load, since maxing out database capacity with a migration script could bring
// the site down otherwise. See `runThenSleep`.
const DEFAULT_LOAD_FACTOR = 0.5;

export const availableMigrations = {};
export const migrationRunners = {};

// Put migration functions in a dictionary Vulcan.migrations to make it
// accessible in meteor shell, working around awkward inability to import
// things non-relatively there.
Vulcan.migrations = migrationRunners;

export function registerMigration({ name, dateWritten, idempotent, action })
{
  if (!name) throw new Error("Missing argument: name");
  if (!dateWritten)
    throw new Error(`Migration ${name} is missing required field: dateWritten`);
  if (!action)
    throw new Error(`Migration ${name} is missing required field: action`);
  
  // The 'idempotent' parameter is mostly about forcing you to explicitly think
  // about migrations' idempotency and make them idempotent, and only
  // secondarily to enable the possibility of non-idempotent migrations later.
  // If you try to define a migration without marking it idempotent, throw an
  // error.
  if (!idempotent) {
    throw new Error(`Migration ${name} is not marked as idempotent; it can't use registerMigration unless it's marked as (and is) idempotent.`);
  }

  if (name in availableMigrations) {
    throw new Error(`Duplicate migration or name collision: ${name}`);
  }
  
  availableMigrations[name] = { name, dateWritten, idempotent, action };
  migrationRunners[name] = async () => await runMigration(name);
}

export async function runMigration(name)
{
  if (!(name in availableMigrations))
    throw new Error(`Unrecognized migration: ${name}`);
  // eslint-disable-next-line no-unused-vars
  const { dateWritten, idempotent, action } = availableMigrations[name];
  
  // eslint-disable-next-line no-console
  console.log(`Beginning migration: ${name}`);

  const migrationLogId = await Migrations.insert({
    name: name,
    started: new Date(),
  });
  
  try {
    await action();
    
    await Migrations.update({_id: migrationLogId}, {$set: {
      finished: true, succeeded: true,
    }});

    // eslint-disable-next-line no-console
    console.log(`Finished migration: ${name}`);
  } catch(e) {
    // eslint-disable-next-line no-console
    console.error(`FAILED migration: ${name}.`);
    // eslint-disable-next-line no-console
    console.error(e);
    
    await Migrations.update({_id: migrationLogId}, {$set: {
      finished: true, succeeded: false,
    }});
  }
}

function sleep(ms)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run a function, timing how long it took, then sleep for an amount of time
// such that if you apply this to each of a series of batches, the fraction of
// time spent not sleeping is equal to `loadFactor`. Used when doing a batch
// migration or similarly slow operation, which can be broken into smaller
// steps, to keep the database load low enough for the site to keep running.
export async function runThenSleep(loadFactor, func)
{
  if (loadFactor <=0 || loadFactor > 1)
    throw new Error(`Invalid loadFactor ${loadFactor}: must be in (0,1].`);

  const startTime = new Date();
  try {
    await func();
  } finally {
    const endTime = new Date();
    const timeSpentMs = endTime.valueOf()-startTime.valueOf();

    // loadFactor = timeSpentMs / (timeSpentMs + sleepTimeMs)
    //   [Algebra happens]
    // sleepTimeMs = timeSpentMs * (1/loadFactor - 1)
    const sleepTimeMs = timeSpentMs * ((1/loadFactor) - 1);
    await sleep(sleepTimeMs);
  }
}

// Given a collection which has a field that has a default value (specified
// with ...schemaDefaultValue), fill in the default value for any rows where it
// is missing.
export async function fillDefaultValues<T extends DbObject>({ collection, fieldName, batchSize, loadFactor=DEFAULT_LOAD_FACTOR }: {
  collection: CollectionBase<T>,
  fieldName: string,
  batchSize?: number,
  loadFactor?: number
})
{
  if (!collection) throw new Error("Missing required argument: collection");
  if (!fieldName) throw new Error("Missing required argument: fieldName");
  const schema = getSchema(collection);
  if (!schema) throw new Error(`Collection ${collection.collectionName} does not have a schema`);
  const defaultValue = schema[fieldName].defaultValue;
  if (defaultValue === undefined) throw new Error(`Field ${fieldName} does not have a default value`);
  if (!schema[fieldName].canAutofillDefault) throw new Error(`Field ${fieldName} is not marked autofillable`);

  // eslint-disable-next-line no-console
  console.log(`Filling in default values of ${collection.collectionName}.${fieldName}`);
  
  let nMatched = 0;
  
  await forEachBucketRangeInCollection({
    collection, bucketSize: batchSize||10000,
    filter: {
      [fieldName]: null
    },
    fn: async (bucketSelector) => {
      await runThenSleep(loadFactor, async () => {
        const mutation = { $set: {
          [fieldName]: defaultValue
        } };
        const writeResult = collection.update(bucketSelector, mutation, {multi: true});
        
        nMatched += writeResult || 0;
        // eslint-disable-next-line no-console
        console.log(`Finished bucket. Write result: ${JSON.stringify(writeResult)}`);
      });
    }
  });

  // eslint-disable-next-line no-console
  console.log(`Done. ${nMatched} rows matched`);
}

// Given a query which finds documents in need of a migration, and a function
// which takes a batch of documents and migrates them, repeatedly search for
// unmigrated documents and call the migrate function, until there are no
// unmigrated documents left.
//
// `migrate` should be a function which takes an array of documents (from a
// `collection.find`), and performs database operations to update them. After
// the update is performed, the documents should no longer match
// unmigratedDocumentQuery. (If they do, and the same document gets returned
// in any two consecutive queries, this will abort and throw an exception.
// However, this is not guaranteed to ever happen, because the
// unmigratedDocumentQuery is run without a sort criterion applied).
//
// No special effort is made to do locking or protect you from race conditions
// if things other than this migration script are happening on the same
// database. This function makes sense for filling in new denormalized fields,
// where figuring out the new field's value requires an additional query.
export async function migrateDocuments<T extends DbObject>({ description, collection, batchSize, unmigratedDocumentQuery, migrate, loadFactor=DEFAULT_LOAD_FACTOR }: {
  description?: string,
  collection: CollectionBase<T>,
  batchSize?: number,
  unmigratedDocumentQuery?: any,
  migrate: (documents: Array<T>) => Promise<void>,
  loadFactor?: number,
})
{
  // Validate arguments
  if (!collection) throw new Error("Missing required argument: collection");
  // if (!unmigratedDocumentQuery) throw new Error("Missing required argument: unmigratedDocumentQuery");
  if (!migrate) throw new Error("Missing required argument: migrate");
  if (!batchSize || !(batchSize>0))
    throw new Error("Invalid batch size");

  if (!description)
    description = "Migration on "+collection.collectionName;

  // eslint-disable-next-line no-console
  console.log(`Beginning migration step: ${description}`);

  if (!unmigratedDocumentQuery) {
    // eslint-disable-next-line no-console
    console.log(`No unmigrated-document query found, migrating all documents in ${collection.collectionName}`)
    await forEachDocumentBatchInCollection({collection, batchSize, callback: migrate, loadFactor})
    // eslint-disable-next-line no-console
    console.log(`Finished migration step ${description} for all documents`)
    return
  }

  let previousDocumentIds = {};
  let documentsAffected = 0;
  let done = false;

  // eslint-disable-next-line no-constant-condition
  while(!done) {
    await runThenSleep(loadFactor, async () => {
      let documents = collection.find(unmigratedDocumentQuery, {limit: batchSize}).fetch();

      if (!documents.length) {
        done = true;
        return;
      }

      // Check if any of the documents returned were supposed to have been
      // migrated by the previous batch's update operation.
      let docsNotMigrated = _.filter(documents, doc => previousDocumentIds[doc._id]);
      if (docsNotMigrated.length > 0) {
        let errorMessage = `Documents not updated in migrateDocuments: ${_.map(docsNotMigrated, doc=>doc._id)}`;

        // eslint-disable-next-line no-console
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      previousDocumentIds = {};
      _.each(documents, doc => previousDocumentIds[doc._id] = true);

      // Migrate documents in the batch
      try {
        await migrate(documents);
        documentsAffected += documents.length;
        // eslint-disable-next-line no-console
        console.log("Documents updated: ", documentsAffected)
      } catch(e) {
        // eslint-disable-next-line no-console
        console.error("Error running migration");
        // eslint-disable-next-line no-console
        console.error(JSON.stringify(e));
        throw(e);
      }
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Finished migration step: ${description}. ${documentsAffected} documents affected.`);
}

export async function dropUnusedField(collection, fieldName) {
  const loadFactor = 0.5;
  let nMatched = 0;
  
  await forEachBucketRangeInCollection({
    collection,
    filter: {
      [fieldName]: {$exists: true}
    },
    fn: async (bucketSelector) => {
      await runThenSleep(loadFactor, async () => {
        const mutation = { $unset: {
          [fieldName]: 1
        } };
        const writeResult = await collection.update(
          bucketSelector,
          mutation,
          {multi: true}
        );
        
        nMatched += writeResult;
      });
    }
  });
  
  // eslint-disable-next-line no-console
  console.log(`Dropped unused field ${collection.collectionName}.${fieldName} (${nMatched} rows)`);
}

// Given a collection and a batch size, run a callback for each row in the
// collection, grouped into batches of up to the given size. Rows created or
// deleted while this is running might or might not get included (neither is
// guaranteed).
//
// This works by querying a range of IDs, with a limit, and using the largest
// ID from each batch to find the start of the interval for the next batch.
// This expects that `max` is a sensible operation on IDs, treated the same
// way in Javascript as in Mongo; which translates into the assumption that IDs
// are homogenously string typed. Ie, this function will break if some rows
// have _id of type ObjectID instead of string.
export async function forEachDocumentBatchInCollection({collection, batchSize=1000, filter=null, callback, loadFactor=1.0}: {
  collection: any,
  batchSize?: number,
  filter?: MongoSelector<DbObject> | null,
  callback: Function,
  loadFactor?: number
})
{
  // As described in the docstring, we need to be able to query on the _id.
  // Without this check, someone trying to use _id in the filter would overwrite
  // this function's query and find themselves with an infinite loop.
  if (filter && '_id' in filter) {
    throw new Error('forEachDocumentBatchInCollection does not support filtering by _id')
  }
  let rows = await collection.find({ ...filter },
    {
      sort: {_id: 1},
      limit: batchSize
    }
  ).fetch();
  
  while(rows.length > 0) {
    await runThenSleep(loadFactor, async () => {
      await callback(rows);
      const lastID = rows[rows.length - 1]._id
      rows = await collection.find(
        { _id: {$gt: lastID}, ...filter },
        {
          sort: {_id: 1},
          limit: batchSize
        }
      ).fetch();
    });
  }
}

// Given a collection, an optional filter, and a target batch size, partition
// the collection into buckets of approximately that size, and call a function
// with a series of selectors that narrow the collection to each of those
// buckets.
//
// collection: The collection to iterate over.
// filter: (Optional) A mongo query which constrains the subset of documents
//     iterated over.
// bucketSize: Approximate number of results in each bucket. This will not
//     be exact, both because buckets will be approximately balanced (so eg if
//     you ask for 2k-row buckets of a 3k-row collection, you actually get
//     1.5k-row average buckets), and because bucket boundaries are generated
//     by a statistical approximation using sampling.
// fn: (bucketSelector=>null) Callback function run for each bucket. Takes a
//     selector, which includes both an _id range (either one- or two-sided)
//     and also the selector from `filter`.
export async function forEachBucketRangeInCollection({collection, filter, bucketSize=1000, fn})
{
  // Get filtered collection size and use it to calculate a number of buckets
  const count = await collection.find(filter).count();

  // If no documents match the filter, return with zero batches
  if (count === 0) return;
  
  // Calculate target number of buckets
  const bucketCount = Math.max(1, Math.floor(count / bucketSize));

  // Calculate target sample size
  const sampleSize = 20 * bucketCount

  // Calculate bucket boundaries using Mongo aggregate
  const maybeFilter = (filter ? [{ $match: filter }] : []);
  const bucketBoundaries = await collection.rawCollection().aggregate([
    ...maybeFilter,
    { $sample: { size: sampleSize } },
    { $sort: {_id: 1} },
    { $bucketAuto: { groupBy: '$_id', buckets: bucketCount}},
    { $project: {value: '$_id.max', _id: 0}}
  ]).toArray();

  // Starting at the lowest bucket boundary, iterate over buckets
  await fn({
    _id: {$lt: bucketBoundaries[0].value},
    ...filter
  });
  
  for (let i=0; i<bucketBoundaries.length-1; i++) {
    await fn({
      _id: {
        $gte: bucketBoundaries[i].value,
        $lt: bucketBoundaries[i+1].value,
      },
      ...filter
    })
  }
  
  await fn({
    _id: {$gte: bucketBoundaries[bucketBoundaries.length-1].value},
    ...filter
  });
}

Vulcan.dropUnusedField = dropUnusedField
