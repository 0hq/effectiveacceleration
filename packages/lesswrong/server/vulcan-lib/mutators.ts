/*

Mutations have five steps:

1. Validation

If the mutator call is not trusted (for example, it comes from a GraphQL mutation),
we'll run all validate steps:

- Check that the current user has permission to insert/edit each field.
- Add userId to document (insert only).
- Run validation callbacks.

2. Before Callbacks

The second step is to run the mutation argument through all the [before] callbacks.

3. Operation

We then perform the insert/update/remove operation.

4. After Callbacks

We then run the mutation argument through all the [after] callbacks.

5. Async Callbacks

Finally, *after* the operation is performed, we execute any async callbacks.
Being async, they won't hold up the mutation and slow down its response time
to the client.

*/

import { Utils } from '../../lib/vulcan-lib/utils';
import { validateDocument, validateData, dataToModifier, modifierToData, } from './validation';
import { getSchema } from '../../lib/utils/getSchema';
import { throwError } from './errors';
import { Connectors } from './connectors';
import { getCollectionHooks, CollectionMutationCallbacks, CreateCallbackProperties, UpdateCallbackProperties, DeleteCallbackProperties } from '../mutationCallbacks';
import { createAnonymousContext } from './query';
import clone from 'lodash/clone';
import isEmpty from 'lodash/isEmpty';
import { createError } from 'apollo-errors';
import pickBy from 'lodash/pickBy';

//
// Create mutation
// Inserts an entry in a collection, and runs a bunch of callback functions to
// fill in its denormalized fields etc. Input is a Partial<T>, because some
// fields will be filled in by those callbacks; result is a T, but nothing
// in the type system ensures that everything actually gets filled in.
//
export const createMutator = async <T extends DbObject>({
  collection,
  document,
  data,
  currentUser=null,
  validate=true,
  context,
}: {
  collection: CollectionBase<T>,
  document: Partial<DbInsertion<T>>,
  data?: Partial<DbInsertion<T>>,
  currentUser?: DbUser|null,
  validate?: boolean,
  context?: ResolverContext,
}): Promise<{
  data: T
}> => {
  // OpenCRUD backwards compatibility: accept either data or document
  // we don't want to modify the original document
  document = data || document;
  
  // If no context is provided, create a new one (so that callbacks will have
  // access to loaders)
  if (!context)
    context = createAnonymousContext();

  const { collectionName } = collection;
  const schema = getSchema(collection);
  
  // Cast because the type system doesn't know that the collectionName on a
  // collection object identifies the collection object type
  const hooks = getCollectionHooks(collectionName) as unknown as CollectionMutationCallbacks<T>;

  /*

  Properties

  Note: keep newDocument for backwards compatibility

  */
  const properties: CreateCallbackProperties<T> = {
    data: data as unknown as T, // Pretend this isn't Partial<T>
    currentUser, collection, context,
    document: document as unknown as T, // Pretend this isn't Partial<T>
    newDocument: document as unknown as T, // Pretend this isn't Partial<T>
    schema
  };

  /*

  Validation

  */
  if (validate) {
    let validationErrors: Array<any> = [];
    validationErrors = validationErrors.concat(validateDocument(document, collection, context));
    // run validation callbacks
    validationErrors = await hooks.createValidate.runCallbacks({
      iterator: validationErrors,
      properties: [properties],
      ignoreExceptions: false,
    });
    // OpenCRUD backwards compatibility
    document = await hooks.newValidate.runCallbacks({
      iterator: document as DbInsertion<T>, // Pretend this isn't Partial<T>
      properties: [currentUser, validationErrors],
      ignoreExceptions: false,
    });
    if (validationErrors.length) {
      console.log(validationErrors); // eslint-disable-line no-console
      throwError({ id: 'app.validation_error', data: { break: true, errors: validationErrors } });
    }
  }

  // userId
  // 
  // If user is logged in, check if userId field is in the schema and add it to
  // document if needed.
  // FIXME: This is a horrible hack; there's no good reason for this not to be
  // using the same callbacks as everything else.
  if (currentUser) {
    const userIdInSchema = Object.keys(schema).find(key => key === 'userId');
    if (!!userIdInSchema && !(document as any).userId) {
      (document as any).userId = currentUser._id;
    }
  }

  /*

  onCreate

  note: cannot use forEach with async/await.
  See https://stackoverflow.com/a/37576787/649299

  note: clone arguments in case callbacks modify them

  */
  for (let fieldName of Object.keys(schema)) {
    let autoValue;
    const schemaField = schema[fieldName];
    if (schemaField.onCreate) {
      // OpenCRUD backwards compatibility: keep both newDocument and data for now, but phase out newDocument eventually
      // eslint-disable-next-line no-await-in-loop
      autoValue = await schemaField.onCreate({...properties, fieldName} as any); // eslint-disable-line no-await-in-loop
    } else if (schemaField.onInsert) {
      // OpenCRUD backwards compatibility
      autoValue = await schemaField.onInsert(clone(document) as any, currentUser); // eslint-disable-line no-await-in-loop
    }
    if (typeof autoValue !== 'undefined') {
      document[fieldName] = autoValue;
    }
  }

  // TODO: find that info in GraphQL mutations
  // if (isServer && this.connection) {
  //   post.userIP = this.connection.clientAddress;
  //   post.userAgent = this.connection.httpHeaders['user-agent'];
  // }

  /*

  Before

  */
  document = await hooks.createBefore.runCallbacks({
    iterator: document as unknown as T, // Pretend this isn't Partial<T>
    properties: [properties],
  }) as unknown as Partial<DbInsertion<T>>;
  // OpenCRUD backwards compatibility
  document = await hooks.newBefore.runCallbacks({
    iterator: document as unknown as T, // Pretend this isn't Partial<T>
    properties: [
      currentUser
    ]
  }) as unknown as Partial<DbInsertion<T>>;
  document = await hooks.newSync.runCallbacks({
    iterator: document as unknown as T, // Pretend this isn't Partial<T>
    properties: [currentUser]
  }) as unknown as Partial<DbInsertion<T>>;

  /*

  DB Operation

  */
  document._id = await Connectors.create(collection, document as unknown as T);

  /*

  After

  */
  // run any post-operation sync callbacks
  document = await hooks.createAfter.runCallbacks({
    iterator: document as unknown as T, // Pretend this isn't Partial<T>
    properties: [properties],
  }) as unknown as DbInsertion<T>;
  // OpenCRUD backwards compatibility
  document = await hooks.newAfter.runCallbacks({
    iterator: document as unknown as T, // Pretend this isn't Partial<T>
    properties: [currentUser]
  }) as unknown as DbInsertion<T>;

  // note: query for document to get fresh document with collection-hooks effects applied
  let completedDocument: T = document as unknown as T;
  const queryResult = await Connectors.get(collection, document._id);
  if (queryResult)
    completedDocument = queryResult;

  /*

  Async

  */
  // note: make sure properties.document is up to date
  await hooks.createAsync.runCallbacksAsync(
    [{ ...properties, document: completedDocument as T }],
  );
  // OpenCRUD backwards compatibility
  await hooks.newAsync.runCallbacksAsync([
    completedDocument,
    currentUser,
    collection
  ]);

  return { data: completedDocument };
};

//
// Update mutation
// Updates a single database entry, and runs callbacks/etc to update its
// denormalized fields. The preferred way to do this is with a documentId;
// in theory you can use a selector, but you should only do this if you're sure
// there's only one matching document (eg, slug). Returns the modified document.
//
export const updateMutator = async <T extends DbObject>({
  collection,
  documentId,
  selector,
  data: dataParam,
  set = {},
  unset = {},
  currentUser=null,
  validate=true,
  context,
  document: oldDocument,
}: {
  collection: CollectionBase<T>,
  documentId: string,
  selector?: any,
  data?: Partial<DbInsertion<T>>,
  set?: Partial<DbInsertion<T>>,
  unset?: any,
  currentUser?: DbUser|null,
  validate?: boolean,
  context?: ResolverContext,
  document?: T|null,
}): Promise<{
  data: T
}> => {
  const { collectionName } = collection;
  const schema = getSchema(collection);

  // If no context is provided, create a new one (so that callbacks will have
  // access to loaders)
  if (!context)
    context = createAnonymousContext();

  // OpenCRUD backwards compatibility
  selector = selector || { _id: documentId };
  let data = dataParam || modifierToData({ $set: set, $unset: unset });
  
  // Cast because the type system doesn't know that the collectionName on a
  // collection object identifies the collection object type
  const hooks = getCollectionHooks(collectionName) as unknown as CollectionMutationCallbacks<T>;

  if (isEmpty(selector)) {
    throw new Error('Selector cannot be empty');
  }

  // get original document from database or arguments
  oldDocument = oldDocument || (await Connectors.get(collection, selector));

  if (!oldDocument) {
    throw new Error(`Could not find document to update for selector: ${JSON.stringify(selector)}`);
  }

  // get a "preview" of the new document
  let document: T = { ...oldDocument, ...data };
  // FIXME: Filtering out null-valued fields here is a very sketchy, probably
  // wrong thing to do. This originates from Vulcan, and it's not clear why it's
  // doing it. Explicit cast to make it type-check anyways.
  document = pickBy(document, f => f !== null) as any;

  /*

  Properties

  */
  const properties: UpdateCallbackProperties<T> = {
    data: data||{},
    oldDocument,
    document,
    newDocument: document,
    currentUser, collection, context, schema
  };

  /*

  Validation

  */
  if (validate) {
    let validationErrors: any = [];

    validationErrors = validationErrors.concat(validateData(data, document, collection, context));

    validationErrors = await hooks.updateValidate.runCallbacks({
      iterator: validationErrors,
      properties: [properties],
      ignoreExceptions: false,
    });
    // OpenCRUD backwards compatibility
    data = modifierToData(
      await hooks.editValidate.runCallbacks({
        iterator: dataToModifier(data),
        properties: [document, currentUser, validationErrors],
        ignoreExceptions: false,
      })
    );

    // LESSWRONG - added custom message (showing all validation errors instead of a generic message)
    if (validationErrors.length) {
      console.log('// validationErrors'); // eslint-disable-line no-console
      console.log(validationErrors); // eslint-disable-line no-console
      const EditDocumentValidationError = createError('app.validation_error', {message: JSON.stringify(validationErrors)});
      throw new EditDocumentValidationError({data: { break: true, errors: validationErrors }});
    }
  }

  /*

  onUpdate

  */
  for (let fieldName of Object.keys(schema)) {
    let autoValue;
    const schemaField = schema[fieldName];
    if (schemaField.onUpdate) {
      // eslint-disable-next-line no-await-in-loop
      autoValue = await schemaField.onUpdate({...properties, fieldName});
    } else if (schemaField.onEdit) {
      // OpenCRUD backwards compatibility
      // eslint-disable-next-line no-await-in-loop
      autoValue = await schemaField.onEdit(
        dataToModifier(clone(data)),
        oldDocument,
        currentUser,
        document
      );
    }
    if (typeof autoValue !== 'undefined') {
      data![fieldName] = autoValue;
    }
  }

  /*

  Before

  */
  data = await hooks.updateBefore.runCallbacks({
    iterator: data,
    properties: [properties],
  });
  // OpenCRUD backwards compatibility
  data = modifierToData(
    await hooks.editBefore.runCallbacks({
      iterator: dataToModifier(data),
      properties: [
        oldDocument,
        currentUser,
        document
      ]
    })
  );
  data = modifierToData(
    await hooks.editSync.runCallbacks({
      iterator: dataToModifier(data),
      properties: [
        oldDocument,
        currentUser,
        document
      ]
    })
  );

  // update connector requires a modifier, so get it from data
  const modifier = dataToModifier(data);

  // remove empty modifiers
  if (isEmpty(modifier.$set)) {
    delete modifier.$set;
  }
  if (isEmpty(modifier.$unset)) {
    delete modifier.$unset;
  }

  /*

  DB Operation

  */
  if (!isEmpty(modifier)) {
    // update document
    await Connectors.update(collection, selector, modifier, { removeEmptyStrings: false });

    // get fresh copy of document from db
    const fetched = await Connectors.get(collection, selector);
    if (!fetched)
      throw new Error("Could not find updated document after applying update");
    document = fetched;

    // TODO: add support for caching by other indexes to Dataloader
    // https://github.com/VulcanJS/Vulcan/issues/2000
    // clear cache if needed
    if (selector.documentId && context) {
      context.loaders[collectionName].clear(selector.documentId);
    }
  }

  /*

  After

  */
  document = await hooks.updateAfter.runCallbacks({
    iterator: document,
    properties: [properties],
  });
  // OpenCRUD backwards compatibility
  document = await hooks.editAfter.runCallbacks({
    iterator: document,
    properties: [
      oldDocument,
      currentUser
    ]
  });

  /*

  Async

  */
  // run async callbacks
  await hooks.updateAsync.runCallbacksAsync([properties]);
  // OpenCRUD backwards compatibility
  await hooks.editAsync.runCallbacksAsync([
    document,
    oldDocument,
    currentUser,
    collection
  ]);

  return { data: document };
};

//
// Delete mutation
// Deletes a single database entry, and runs any callbacks/etc that trigger on
// that. Returns the entry that was deleted.
//
export const deleteMutator = async <T extends DbObject>({
  collection,
  documentId,
  selector,
  currentUser=null,
  validate=true,
  context,
  document,
}: {
  collection: CollectionBase<T>,
  documentId: string,
  selector?: MongoSelector<T>,
  currentUser?: DbUser|null,
  validate?: boolean,
  context?: ResolverContext,
  document?: T|null,
}): Promise<{
  data: T|null|undefined
}> => {
  const { collectionName } = collection;
  const schema = getSchema(collection);
  // OpenCRUD backwards compatibility
  selector = selector || { _id: documentId };
  
  // Cast because the type system doesn't know that the collectionName on a
  // collection object identifies the collection object type
  const hooks = getCollectionHooks(collectionName) as unknown as CollectionMutationCallbacks<T>;

  // If no context is provided, create a new one (so that callbacks will have
  // access to loaders)
  if (!context)
    context = createAnonymousContext();

  if (isEmpty(selector)) {
    throw new Error('Selector cannot be empty');
  }

  document = document || (await Connectors.get(collection, selector));

  if (!document) {
    throw new Error(`Could not find document to delete for selector: ${JSON.stringify(selector)}`);
  }

  /*

  Properties

  */
  const properties: DeleteCallbackProperties<T> = { document, currentUser, collection, context, schema };

  /*

  Validation

  */
  if (validate) {
    let validationErrors: any = [];

    validationErrors = await hooks.deleteValidate.runCallbacks({
      iterator: validationErrors,
      properties: [properties],
      ignoreExceptions: false,
    });
    // OpenCRUD backwards compatibility
    document = await hooks.removeValidate.runCallbacks({
      iterator: document,
      properties: [currentUser],
      ignoreExceptions: false,
    });

    if (validationErrors.length) {
      console.log(validationErrors); // eslint-disable-line no-console
      throwError({ id: 'app.validation_error', data: { break: true, errors: validationErrors } });
    }
  }

  /*

  onDelete

  */
  for (let fieldName of Object.keys(schema)) {
    if (schema[fieldName].onDelete) {
      await schema[fieldName].onDelete(properties); // eslint-disable-line no-await-in-loop
    } else if (schema[fieldName].onRemove) {
      // OpenCRUD backwards compatibility
      await schema[fieldName].onRemove(document, currentUser); // eslint-disable-line no-await-in-loop
    }
  }

  /*

  Before

  */
  await hooks.deleteBefore.runCallbacks({
    iterator: document,
    properties: [properties],
  });
  // OpenCRUD backwards compatibility
  await hooks.removeBefore.runCallbacks({
    iterator: document,
    properties: [currentUser]
  });
  await hooks.removeSync.runCallbacks({
    iterator: document,
    properties: [currentUser]
  });

  /*

  DB Operation

  */
  await Connectors.delete(collection, selector);

  // TODO: add support for caching by other indexes to Dataloader
  // clear cache if needed
  if (selector.documentId && context) {
    context.loaders[collectionName].clear(selector.documentId);
  }

  /*

  Async

  */
  await hooks.deleteAsync.runCallbacksAsync([properties]);
  // OpenCRUD backwards compatibility
  await hooks.removeAsync.runCallbacksAsync([
    document,
    currentUser,
    collection
  ]);

  return { data: document };
};

Utils.createMutator = createMutator;
Utils.updateMutator = updateMutator;
Utils.deleteMutator = deleteMutator;
