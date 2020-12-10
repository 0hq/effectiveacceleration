import { addCallback, getCollection } from '../vulcan-lib';
import { restrictViewableFields } from '../vulcan-users/permissions';
import SimpleSchema from 'simpl-schema'
import { getWithLoader } from "../loaders";
import { isServer } from '../executionEnvironment';
import { asyncFilter } from './asyncUtils';
import DataLoader from 'dataloader';
import * as _ from 'underscore';

export const generateIdResolverSingle = <CollectionName extends CollectionNameString>({
  collectionName, fieldName, nullable
}: {
  collectionName: CollectionName,
  fieldName: string,
  nullable: boolean,
}) => {
  type DataType = ObjectsByCollectionName[CollectionName];
  return async (doc: any, args: void, context: ResolverContext): Promise<DataType|null> => {
    if (!doc[fieldName]) return null

    const { currentUser } = context
    const collection = context[collectionName] as unknown as CollectionBase<DataType>

    const loader = context.loaders[collectionName] as DataLoader<string,DataType>;
    const resolvedDoc: DataType|null = await loader.load(doc[fieldName])
    if (!resolvedDoc) {
      if (!nullable) {
        // eslint-disable-next-line no-console
        console.error(`Broken foreign key reference: ${collectionName}.${fieldName}=${doc[fieldName]}`);
      }
      return null;
    }

    return await accessFilterSingle(currentUser, collection, resolvedDoc, context);
  }
}

const generateIdResolverMulti = <CollectionName extends CollectionNameString>({
  collectionName, fieldName,
  getKey = ((a:any)=>a)
}: {
  collectionName: CollectionName,
  fieldName: string,
  getKey?: (key: string) => string,
}) => {
  type DbType = ObjectsByCollectionName[CollectionName];
  
  return async (doc: any, args: void, context: ResolverContext): Promise<Array<DbType>> => {
    if (!doc[fieldName]) return []
    const keys = doc[fieldName].map(getKey)

    const { currentUser } = context
    const collection = context[collectionName] as unknown as CollectionBase<DbType>

    const loader = context.loaders[collectionName] as DataLoader<string,DbType>;
    const resolvedDocs: Array<DbType> = await loader.loadMany(keys)

    return await accessFilterMultiple(currentUser, collection, resolvedDocs, context);
  }
}

// Apply both document-level and field-level permission checks to a single document.
// If the user can't access the document, returns null. If the user can access the
// document, return a copy of the document in which any fields the user can't access
// have been removed. If document is null, returns null.
export const accessFilterSingle = async <T extends DbObject>(currentUser: DbUser|null, collection: CollectionBase<T>, document: T|null, context: ResolverContext|null): Promise<T|null> => {
  const { checkAccess } = collection
  if (!document) return null;
  if (checkAccess && !(await checkAccess(currentUser, document, context))) return null
  const restrictedDoc = restrictViewableFields(currentUser, collection, document)
  return restrictedDoc;
}

// Apply both document-level and field-level permission checks to a list of documents.
// Returns a list where documents which the user can't access are removed from the
// list, and fields which the user can't access are removed from the documents inside
// the list. If currentUser is null, applies permission checks for the logged-out
// view.
export const accessFilterMultiple = async <T extends DbObject>(currentUser: DbUser|null, collection: CollectionBase<T>, unfilteredDocs: Array<T|null>, context: ResolverContext|null): Promise<Array<T>> => {
  const { checkAccess } = collection
  
  // Filter out nulls (docs that were referenced but didn't exist)
  // Explicit cast because the type-system doesn't detect that this is removing
  // nulls.
  const existingDocs: Array<T> = _.filter(unfilteredDocs, d=>!!d) as Array<T>;
  // Apply the collection's checkAccess function, if it has one, to filter out documents
  const filteredDocs = checkAccess ? await asyncFilter(existingDocs, async (d: T) => await checkAccess(currentUser, d, context)) : existingDocs
  // Apply field-level permissions
  const restrictedDocs = restrictViewableFields(currentUser, collection, filteredDocs)
  
  return restrictedDocs;
}

export const foreignKeyField = <CollectionName extends CollectionNameString>({idFieldName, resolverName, collectionName, type, nullable=true}: {
  idFieldName: string,
  resolverName: string,
  collectionName: CollectionName,
  type: string,
  nullable?: boolean,
}) => {
  if (!idFieldName || !resolverName || !collectionName || !type)
    throw new Error("Missing argument to foreignKeyField");
  
  return {
    type: String,
    foreignKey: collectionName,
    resolveAs: {
      fieldName: resolverName,
      type: nullable ? type : `${type}!`,
      resolver: generateIdResolverSingle({
        collectionName,
        fieldName: idFieldName,
        nullable,
      }),
      addOriginalField: true,
    },
  }
}

export function arrayOfForeignKeysField<CollectionName extends keyof CollectionsByName>({idFieldName, resolverName, collectionName, type, getKey}: {
  idFieldName: string,
  resolverName: string,
  collectionName: CollectionName,
  type: string,
  getKey?: (key: any)=>string,
}) {
  if (!idFieldName || !resolverName || !collectionName || !type)
    throw new Error("Missing argument to foreignKeyField");
  
  return {
    type: Array,
    resolveAs: {
      fieldName: resolverName,
      type: `[${type}!]!`,
      resolver: generateIdResolverMulti({
        collectionName,
        fieldName: idFieldName,
        getKey
      }),
      addOriginalField: true
    },
  }
}

export const simplSchemaToGraphQLtype = (type: any): string|null => {
  if (type === String) return "String";
  else if (type === Number) return "Int";
  else if (type === Date) return "Date";
  else if (type === Boolean) return "Boolean";
  else return null;
}

interface ResolverOnlyFieldArgs<T extends DbObject> extends CollectionFieldSpecification<T> {
  resolver: (doc: T, args: any, context: ResolverContext) => any,
  graphQLtype?: string|null,
  graphqlArguments?: string|null,
}
export const resolverOnlyField = <T extends DbObject>({type, graphQLtype=null, resolver, graphqlArguments=null, ...rest}: ResolverOnlyFieldArgs<T>): CollectionFieldSpecification<T> => {
  const resolverType = graphQLtype || simplSchemaToGraphQLtype(type);
  if (!type || !resolverType)
    throw new Error("Could not determine resolver graphQL type");
  return {
    type: type,
    optional: true,
    resolveAs: {
      type: resolverType,
      arguments: graphqlArguments,
      resolver: resolver,
    },
    ...rest
  }
}

// Given a collection and a fieldName=>fieldSchema dictionary, add fields to
// the collection schema. If any of the fields mentioned are already present,
// they will be shallow-merged. This is used for making parts of the schema
// (in particular, resolvers, onCreate callbacks, etc) specific to server-side
// code.
export const addFieldsDict = <T extends DbObject>(collection: CollectionBase<T>, fieldsDict: Record<string,CollectionFieldSpecification<T>>): void => {
  const schema = collection.simpleSchema()._schema;
  const mergedSchema = {};
  
  // loop over fields and add them to schema (or extend existing fields)
  for (let key in fieldsDict) {
    if (key in schema)
      mergedSchema[key] = {...schema[key], ...fieldsDict[key]};
    else
      mergedSchema[key] = fieldsDict[key];
  }
  

  // add field schema to collection schema
  const newSchema = collection.simpleSchema().extend(mergedSchema);
  collection.simpleSchema = () => newSchema;
}

// For auto-generated database type definitions, provides a (string) definition
// of this field's type. Useful for fields that would otherwise be black-box types.
SimpleSchema.extendOptions(['typescriptType'])

// For denormalized fields, needsUpdate is an optional attribute that
// determines whether the denormalization function should be rerun given
// the new document after an update or an insert
SimpleSchema.extendOptions(['needsUpdate'])

// For denormalized fields, getValue returns the new denormalized value of
// the field, given the new document after an update or an insert
SimpleSchema.extendOptions(['getValue'])

// For denormalized fields, marks a field so that we can automatically
// get the automatically recompute the new denormalized value via
// `Vulcan.recomputeDenormalizedValues` in the Meteor shell
SimpleSchema.extendOptions(['canAutoDenormalize'])


// Helper function to add all the correct callbacks and metadata for a field
// which is denormalized, where its denormalized value is a function only of
// the other fields on the document. (Doesn't work if it depends on the contents
// of other collections, because it doesn't set up callbacks for changes in
// those collections)
export function denormalizedField<T extends DbObject>({ needsUpdate, getValue }: {
  needsUpdate?: (doc: Partial<T>) => boolean,
  getValue: (doc: T, context: ResolverContext) => any,
}): CollectionFieldSpecification<T> {
  return {
    onUpdate: async ({data, document, context}) => {
      if (!needsUpdate || needsUpdate(data)) {
        return await getValue(document, context)
      }
    },
    onCreate: async ({newDocument, context}) => {
      if (!needsUpdate || needsUpdate(newDocument)) {
        return await getValue(newDocument, context)
      }
    },
    denormalized: true,
    canAutoDenormalize: true,
    optional: true,
    needsUpdate,
    getValue
  }
}

// Create a denormalized field which counts the number of objects in some other
// collection whose value for a field is this object's ID. For example, count
// the number of comments on a post, or the number of posts by a user, updating
// when objects are created/deleted/updated.
export function denormalizedCountOfReferences<SourceType extends DbObject, TargetCollectionName extends keyof ObjectsByCollectionName>({ collectionName, fieldName, foreignCollectionName, foreignTypeName, foreignFieldName, filterFn }: {
  collectionName: CollectionNameString,
  fieldName: string,
  foreignCollectionName: TargetCollectionName,
  foreignTypeName: string,
  foreignFieldName: string,
  filterFn?: (doc: ObjectsByCollectionName[TargetCollectionName])=>boolean,
}): CollectionFieldSpecification<SourceType> {
  type TargetType = ObjectsByCollectionName[TargetCollectionName];
  const foreignCollectionCallbackPrefix = foreignTypeName.toLowerCase();
  const filter = filterFn || ((doc: ObjectsByCollectionName[TargetCollectionName]) => true);
  
  if (isServer)
  {
    // When inserting a new document which potentially needs to be counted, follow
    // its reference and update with $inc.
    const createCallback = async (newDoc, {currentUser, collection, context}) => {
      if (newDoc[foreignFieldName] && filter(newDoc)) {
        const collection = getCollection(collectionName);
        await collection.update(newDoc[foreignFieldName], {
          $inc: { [fieldName]: 1 }
        });
      }
      
      return newDoc;
    }
    (createCallback as any).name = `${collectionName}_${fieldName}_countNew`;
    addCallback(`${foreignCollectionCallbackPrefix}.create.after`, createCallback);
    
    // When updating a document, we may need to decrement a count, we may
    // need to increment a count, we may need to do both with them cancelling
    // out, or we may need to both but on different documents.
    addCallback(`${foreignCollectionCallbackPrefix}.update.after`,
      async (newDoc, {oldDocument, currentUser, collection}) => {
        const countingCollection: any = getCollection(collectionName);
        if (filter(newDoc) && !filter(oldDocument)) {
          // The old doc didn't count, but the new doc does. Increment on the new doc.
          await countingCollection.update(newDoc[foreignFieldName], {
            $inc: { [fieldName]: 1 }
          });
        } else if (!filter(newDoc) && filter(oldDocument)) {
          // The old doc counted, but the new doc doesn't. Decrement on the old doc.
          await countingCollection.update(oldDocument[foreignFieldName], {
            $inc: { [fieldName]: -1 }
          });
        } else if(filter(newDoc) && oldDocument[foreignFieldName] !== newDoc[foreignFieldName]) {
          // The old and new doc both count, but the reference target has changed.
          // Decrement on one doc and increment on the other.
          await countingCollection.update(oldDocument[foreignFieldName], {
            $inc: { [fieldName]: -1 }
          });
          await countingCollection.update(newDoc[foreignFieldName], {
            $inc: { [fieldName]: 1 }
          });
        }
        return newDoc;
      }
    );
    addCallback(`${foreignCollectionCallbackPrefix}.delete.async`,
      async ({document, currentUser, collection}) => {
        if (document[foreignFieldName] && filter(document)) {
          const countingCollection = getCollection(collectionName);
          await countingCollection.update(document[foreignFieldName], {
            $inc: { [fieldName]: -1 }
          });
        }
      }
    );
  }
  
  return {
    type: Number,
    optional: true,
    defaultValue: 0,
    
    denormalized: true,
    canAutoDenormalize: true,
    
    getValue: async (document: SourceType, context: ResolverContext): Promise<number> => {
      const foreignCollection: CollectionBase<TargetType> = getCollection(foreignCollectionName);
      const docsThatMayCount = await getWithLoader(
        context, foreignCollection,
        `denormalizedCount_${collectionName}.${fieldName}`,
        { },
        foreignFieldName,
        document._id
      );
      
      const docsThatCount = _.filter(docsThatMayCount, d=>filter(d));
      return docsThatCount.length;
    }
  }
}

export function googleLocationToMongoLocation(gmaps) {
  return {
    type: "Point",
    coordinates: [gmaps.geometry.location.lng, gmaps.geometry.location.lat]
  }
}
