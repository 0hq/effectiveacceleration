import { LWEvents } from '../lib/collections/lwevents/collection';
import { getSchema } from '../lib/utils/getSchema';
import { Utils } from '../lib/vulcan-lib/utils';

export const logFieldChanges = async <T extends DbObject>({currentUser, collection, oldDocument, data}: {
  currentUser: DbUser|null,
  collection: CollectionBase<T>,
  oldDocument: T,
  data: Partial<T>,
}) => {
  let loggedChangesBefore: any = {};
  let loggedChangesAfter: any = {};
  let schema = getSchema(collection);
  
  for (let key of Object.keys(data)) {
    let before = oldDocument[key], after = data[key];
    // Don't log if:
    //  * The field didn't change
    //  * It's a denormalized field
    //  * The logChanges option is present on the field, and false
    //  * The logChanges option is undefined on the field, and is false on the collection
    if (before===after) continue;
    if (schema[key]?.denormalized) continue;
    if (schema[key]?.logChanges != undefined && !schema[key]?.logChanges)
      continue;
    if (!schema[key]?.logChanges && !collection.options.logChanges)
      continue;
    
    // As a special case, don't log changes from null to undefined (or vise versa).
    // This special case is necessary because some upstream code (updateMutator) is
    // sloppy about the distinction.
    if (before===undefined && after===null) continue;
    if (after===undefined && before===null) continue;
    
    loggedChangesBefore[key] = before;
    loggedChangesAfter[key] = after;
  }
  
  if (Object.keys(loggedChangesAfter).length > 0) {
    void Utils.createMutator({
      collection: LWEvents,
      currentUser,
      document: {
        name: 'fieldChanges',
        documentId: oldDocument._id,
        userId: currentUser?._id,
        important: true,
        properties: {
          before: loggedChangesBefore,
          after: loggedChangesAfter,
        }
      },
      validate: false,
    })
  }
}
