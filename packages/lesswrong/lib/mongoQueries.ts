import { getCollection } from './vulcan-lib/collections';

export async function mongoFindOne<N extends CollectionNameString>(collectionName: N, selector: string|MongoSelector<ObjectsByCollectionName[N]>, options?: MongoFindOneOptions<ObjectsByCollectionName[N]>, projection?: MongoProjection<ObjectsByCollectionName[N]>): Promise<ObjectsByCollectionName[N]|null>
{
  const collection = getCollection(collectionName);
  return await collection.findOne(selector, options, projection) as ObjectsByCollectionName[N]|null;
}

export async function mongoFind<N extends CollectionNameString>(collectionName: N, selector?: MongoSelector<ObjectsByCollectionName[N]>, options?: MongoFindOptions<ObjectsByCollectionName[N]>, projection?: MongoProjection<ObjectsByCollectionName[N]>): Promise<Array<ObjectsByCollectionName[N]>>
{
  const collection = getCollection(collectionName);
  return await collection.find(selector, options, projection).fetch();
}

export async function mongoCount<N extends CollectionNameString>(collectionName: N, selector?: MongoSelector<ObjectsByCollectionName[N]>, options?: MongoFindOptions<ObjectsByCollectionName[N]>, projection?: MongoProjection<ObjectsByCollectionName[N]>): Promise<number>
{
  const collection = getCollection(collectionName);
  return await collection.find(selector, options, projection).count();
}

export async function mongoAggregate<N extends CollectionNameString>(collectionName: N, pipeline: any): Promise<any>
{
  const collection = getCollection(collectionName);
  return await collection.aggregate(pipeline).toArray();
}

export async function mongoUpdate<N extends CollectionNameString>(collectionName: N, selector?: string|MongoSelector<ObjectsByCollectionName[N]>, modifier?: MongoModifier<ObjectsByCollectionName[N]>, options?: MongoUpdateOptions<ObjectsByCollectionName[N]>): Promise<number>
{
  const collection = getCollection(collectionName);
  return await collection.update(selector, modifier, options);
}
export async function mongoRemove<N extends CollectionNameString>(collectionName: N, selector?: string|MongoSelector<ObjectsByCollectionName[N]>, options?: MongoRemoveOptions<ObjectsByCollectionName[N]>)
{
  const collection = getCollection(collectionName);
  return await collection.remove(selector, options);
}

export async function mongoInsert<N extends CollectionNameString>(collectionName: N, insertedObject: ObjectsByCollectionName[N], options: MongoInsertOptions<ObjectsByCollectionName[N]>)
{
  const collection = getCollection(collectionName);
  return await collection.insert(insertedObject, options);
}
