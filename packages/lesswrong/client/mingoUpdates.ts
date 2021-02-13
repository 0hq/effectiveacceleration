/**
 * Helpers to update watched mutations
 */
import Mingo from 'mingo';
import { Utils } from '../lib/vulcan-lib/utils';

/*

Test if a document is matched by a given selector

*/
export const belongsToSet = (document, selector) => {
  try {
    const mingoQuery = new Mingo.Query(selector);
    return mingoQuery.test(document);
  } catch(err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return false
  }  
};

/*

Test if a document is already in a result set

*/
export const isInSet = (data, document) => {
  return data.results.find(item => item._id === document._id);
}

/*

Add a document to a set of results

*/
export const addToSet = (queryData, document) => {
  const newData = {
    results: [...queryData.results, document],
    totalCount: queryData.totalCount + 1,
  };
  return newData;
};

/*

Update a document in a set of results

*/
export const updateInSet = (queryData, document) => {
  const oldDocument = queryData.results.find(item => item._id === document._id);
  const newDocument = { ...oldDocument, ...document };
  const index = queryData.results.findIndex(item => item._id === document._id);
  const newResults = [...queryData.results];
  newResults[index] = newDocument;
  const newData = {
    ...queryData,
    results: newResults
  }; // clone
  return newData;
};

/*

Reorder results according to a sort

*/
export const reorderSet = (queryData, sort, selector) => {
  try {
    const mingoQuery = new Mingo.Query(selector);
    const cursor = mingoQuery.find(queryData.results);
    queryData.results = cursor.sort(sort).all();
    return queryData;  
  } catch(err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return queryData
  }
};

/*

Remove a document from a set

*/
export const removeFromSet = (queryData, document) => {
  const newData = {
    results: queryData.results.filter(item => item._id !== document._id),
    totalCount: queryData.totalCount - 1,
  };
  return newData;
};

Utils.mingoBelongsToSet = belongsToSet;
Utils.mingoIsInSet = isInSet;
Utils.mingoAddToSet = addToSet;
Utils.mingoUpdateInSet = updateInSet;
Utils.mingoReorderSet = reorderSet;
Utils.mingoRemoveFromSet = removeFromSet;
