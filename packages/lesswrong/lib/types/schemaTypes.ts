import type { GraphQLScalarType } from 'graphql';
import type { SimpleSchema } from 'simpl-schema';

/// This file is wrapped in 'declare global' because it's an ambient declaration
/// file (meaning types in this file can be used without being imported).
declare global {

interface CollectionFieldSpecification<T extends DbObject> {
  type?: any,
  description?: string,
  optional?: boolean,
  defaultValue?: any,
  graphQLType?: string,
  typescriptType?: string,
  resolveAs?: {
    type: string|GraphQLScalarType,
    description?: string,
    fieldName?: string,
    addOriginalField?: boolean,
    arguments?: string|null,
    resolver: (root: T, args: any, context: ResolverContext, info?: any)=>any,
  },
  blackbox?: boolean,
  denormalized?: boolean,
  canAutoDenormalize?: boolean,
  canAutofillDefault?: boolean,
  needsUpdate?: (doc: Partial<T>) => boolean,
  getValue?: (doc: T, context: ResolverContext) => any,
  foreignKey?: any,
  
  min?: number,
  max?: number,
  regEx?: any,
  minCount?: number,
  options?: any,
  allowedValues?: any,
  query?: any,
  
  form?: any,
  input?: any,
  beforeComponent?: keyof ComponentTypes,
  order?: number,
  label?: string,
  tooltip?: string,
  control?: string,
  placeholder?: string,
  hidden?: any,
  group?: any,
  inputType?: any,
  
  // Field mutation callbacks, invoked from Vulcan mutators. Notes:
  //  * onInsert and onEdit are deprecated (but still used) because
  //    of Vulcan's mass-renaming and switch to named arguments
  //  * The "document" field in onUpdate is deprecated due to an earlier mixup
  //    (breaking change) affecting whether it means oldDocument or newDocument
  //  * Return type of these callbacks is not enforced because we don't have the
  //    field's type in a usable format here. onInsert, onCreate, onEdit, and
  //    onUpdate should all return a new value for the field, EXCEPT that if
  //    they return undefined the field value is left unchanged.
  //
  onInsert?: (doc: DbInsertion<T>, currentUser: DbUser|null) => any,
  onCreate?: (args: {data: DbInsertion<T>, currentUser: DbUser|null, collection: CollectionBase<T>, context: ResolverContext, document: T, newDocument: T, schema: SchemaType<T>, fieldName: string}) => any,
  onEdit?: (modifier: any, oldDocument: T, currentUser: DbUser|null, newDocument: T) => any,
  onUpdate?: (args: {data: Partial<T>, oldDocument: T, newDocument: T, document: T, currentUser: DbUser|null, collection: CollectionBase<T>, context: ResolverContext, schema: SchemaType<T>, fieldName: string}) => any,
  onDelete?: (args: {document: T, currentUser: DbUser|null, collection: CollectionBase<T>, context: ResolverContext, schema: SchemaType<T>}) => Promise<void>,
  
  
  viewableBy?: any,
  insertableBy?: any,
  editableBy?: any,
  canRead?: any,
  canUpdate?: any,
  canCreate?: any,
}


type SchemaType<T extends DbObject> = Record<string,CollectionFieldSpecification<T>>
type SimpleSchemaType<T extends DbObject> = SimpleSchema & {_schema: SchemaType<T>};

}
