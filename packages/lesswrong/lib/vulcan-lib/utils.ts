/*

Utilities

*/

import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import getSlug from 'speakingurl';
import urlObject from 'url';
import { siteUrlSetting } from '../instanceSettings';
import { DatabasePublicSetting } from '../publicSettings';
export const logoUrlSetting = new DatabasePublicSetting<string | null>('logoUrl', null)

interface UtilsType {
  // In lib/helpers.ts
  getUnusedSlug: <T extends HasSlugType>(collection: CollectionBase<HasSlugType>, slug: string, useOldSlugs?: boolean, documentId?: string) => string
  getUnusedSlugByCollectionName: (collectionName: CollectionNameString, slug: string, useOldSlugs?: boolean, documentId?: string) => string
  slugIsUsed: (collectionName: CollectionNameString, slug: string) => Promise<boolean>
  
  // In client/vulcan-lib/apollo-client/updates.ts
  mingoBelongsToSet: any
  mingoIsInSet: any
  mingoAddToSet: any
  mingoUpdateInSet: any
  mingoReorderSet: any
  mingoRemoveFromSet: any
  
  // In server/vulcan-lib/connectors.ts
  Connectors: any
  
  // In server/tableOfContents.ts
  getTableOfContentsData: any
  extractTableOfContents: any
  
  // In server/vulcan-lib/mutators.ts
  createMutator: any
  updateMutator: any
  deleteMutator: any
  
  // In server/vulcan-lib/utils.ts
  performCheck: <T extends DbObject>(operation: (user: DbUser|null, obj: T, context: any) => Promise<boolean>, user: DbUser|null, checkedObject: T, context: any, documentId: string, operationName: string, collectionName: CollectionNameString) => Promise<void>
  
  // In server/vulcan-lib/errors.ts
  throwError: any
}

export const Utils: UtilsType = ({} as UtilsType);

// @summary Convert a camelCase string to a space-separated capitalized string
// See http://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form
export const camelToSpaces = function (str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
};

// Convert a dash separated string to camelCase.
export const dashToCamel = function (str: string): string {
  return str.replace(/(-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};

// Convert a string to camelCase and remove spaces.
export const camelCaseify = function(str: string): string {
  str = dashToCamel(str.replace(' ', '-'));
  str = str.slice(0,1).toLowerCase() + str.slice(1);
  return str;
};

// Capitalize a string.
export const capitalize = function(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

//////////////////////////
// URL Helper Functions //
//////////////////////////

/**
 * @summary Returns the user defined site URL or Meteor.absoluteUrl. Add trailing '/' if missing
 */
export const getSiteUrl = function (): string {
  let url = siteUrlSetting.get();
  if (url.slice(-1) !== '/') {
    url += '/';
  }
  return url;
};

/**
 * @summary The global namespace for Vulcan utils.
 * @param {String} url - the URL to redirect
 */
export const getOutgoingUrl = function (url: string): string {
  return getSiteUrl() + 'out?url=' + encodeURIComponent(url);
};

export const slugify = function (s: string): string {
  var slug = getSlug(s, {
    truncate: 60
  });

  // can't have posts with an "edit" slug
  if (slug === 'edit') {
    slug = 'edit-1';
  }

  // If there is nothing in the string that can be slugified, just call it unicode
  if (slug === "") {
    slug = "unicode"
  }

  return slug;
};

export const getDomain = function(url: string): string|null {
  try {
    const hostname = urlObject.parse(url).hostname
    return hostname!.replace('www.', '');
  } catch (error) {
    return null;
  }
};

// add http: if missing
export const addHttp = function (url: string): string|null {
  try {
    if (url.substring(0, 5) !== 'http:' && url.substring(0, 6) !== 'https:') {
      url = 'http:'+url;
    }
    return url;
  } catch (error) {
    return null;
  }
};

// Combine urls without extra /s at the join
// https://stackoverflow.com/questions/16301503/can-i-use-requirepath-join-to-safely-concatenate-urls
export const combineUrls = (baseUrl: string, path:string) => {
  return path
    ? baseUrl.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '')
    : baseUrl;
}

// Remove query and anchor tags from path
export const getBasePath = (path: string) => {
  return path.split(/[?#]/)[0]
}

/////////////////////////////
// String Helper Functions //
/////////////////////////////

// http://stackoverflow.com/questions/2631001/javascript-test-for-existence-of-nested-object-key
export const checkNested: any = function(obj /*, level1, level2, ... levelN*/) {
  var args = Array.prototype.slice.call(arguments);
  obj = args.shift();

  for (var i = 0; i < args.length; i++) {
    if (!obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
};

// see http://stackoverflow.com/questions/8051975/access-object-child-properties-using-a-dot-notation-string
export const getNestedProperty = function (obj, desc) {
  var arr = desc.split('.');
  while(arr.length && (obj = obj[arr.shift()]));
  return obj;
};

export const getLogoUrl = (): string|undefined => {
  const logoUrl = logoUrlSetting.get()
  if (logoUrl) {
    const prefix = getSiteUrl().slice(0,-1);
    // the logo may be hosted on another website
    return logoUrl.indexOf('://') > -1 ? logoUrl : prefix + logoUrl;
  }
};

export const encodeIntlError = error => typeof error !== 'object' ? error : JSON.stringify(error);

export const decodeIntlError = (error, options = {stripped: false}) => {
  try {
    // do we get the error as a string or as an error object?
    let strippedError = typeof error === 'string' ? error : error.message;

    // if the error hasn't been cleaned before (ex: it's not an error from a form)
    if (!options.stripped) {
      // strip the "GraphQL Error: message [error_code]" given by Apollo if present
      const graphqlPrefixIsPresent = strippedError.match(/GraphQL error: (.*)/);
      if (graphqlPrefixIsPresent) {
        strippedError = graphqlPrefixIsPresent[1];
      }

      // strip the error code if present
      const errorCodeIsPresent = strippedError.match(/(.*)\[(.*)\]/);
      if (errorCodeIsPresent) {
        strippedError = errorCodeIsPresent[1];
      }
    }

    // the error is an object internationalizable
    const parsedError = JSON.parse(strippedError);

    // check if the error has at least an 'id' expected by react-intl
    if (!parsedError.id) {
      console.error('[Undecodable error]', error); // eslint-disable-line
      return {id: 'app.something_bad_happened', value: '[undecodable error]'};
    }

    // return the parsed error
    return parsedError;
  } catch(__) {
    // the error is not internationalizable
    return error;
  }
};

export const findWhere = (array, criteria) => array.find(item => Object.keys(criteria).every(key => item[key] === criteria[key]));

export const isPromise = (value: any): boolean => isFunction(get(value, 'then'));

export const pluralize = (s: string): string => {
  const plural = s.slice(-1) === 'y' ?
    `${s.slice(0, -1)}ies` :
    s.slice(-1) === 's' ?
      `${s}es` :
      `${s}s`;
  return plural;
};

export const removeProperty = (obj: any, propertyName: string): void => {
  for(const prop in obj) {
    if (prop === propertyName){
      delete obj[prop];
    } else if (typeof obj[prop] === 'object') {
      removeProperty(obj[prop], propertyName);
    }
  }
};
