import pickBy from 'lodash/pickBy';
import mapValues from 'lodash/mapValues';
import { userCanCreateField, userCanUpdateField } from '../../lib/vulcan-users/permissions';
import { getSchema } from '../../lib/utils/getSchema';
import * as _ from 'underscore';

export const dataToModifier = data => ({ 
  $set: pickBy(data, f => f !== null), 
  $unset: mapValues(pickBy(data, f => f === null), () => true),
});

export const modifierToData = modifier => ({
  ...modifier.$set,
  ...mapValues(modifier.$unset, () => null),
});

/*

  If document is not trusted, run validation steps:

  1. Check that the current user has permission to edit each field
  2. Run SimpleSchema validation step

*/
export const validateDocument = (document, collection, context: ResolverContext) => {
  const { currentUser } = context;
  const schema = getSchema(collection);

  let validationErrors: Array<any> = [];

  // Check validity of inserted document
  Object.keys(document).forEach(fieldName => {
    const fieldSchema = schema[fieldName];

    // 1. check that the current user has permission to insert each field
    if (!fieldSchema || !userCanCreateField(currentUser, fieldSchema)) {
      validationErrors.push({
        id: 'errors.disallowed_property_detected',
        properties: { name: fieldName },
      });
    }
  });

  // 5. run SS validation
  const validationContext = collection.simpleSchema().newContext();
  validationContext.validate(document);

  if (!validationContext.isValid()) {
    const errors = validationContext.validationErrors();
    errors.forEach(error => {
      // eslint-disable-next-line no-console
      // console.log(error);
      if (error.type.includes('intlError')) {
        const intlError = JSON.parse(error.type.replace('intlError|', ''));
        validationErrors = validationErrors.concat(intlError);
      } else {
        validationErrors.push({
          id: `errors.${error.type}`,
          path: error.name,
          properties: {
            collectionName: collection.options.collectionName,
            typeName: collection.options.typeName,
            ...error,
          },
        });
      }
    });
  }

  return validationErrors;
};

/*

  If document is not trusted, run validation steps:

  1. Check that the current user has permission to insert each field
  2. Run SimpleSchema validation step
  
*/
export const validateModifier = (modifier, document, collection, context: ResolverContext) => {
  
  const { currentUser } = context;
  const schema = getSchema(collection);
  const set = modifier.$set;
  const unset = modifier.$unset;

  let validationErrors: Array<any> = [];

  // 1. check that the current user has permission to edit each field
  const modifiedProperties = _.keys(set).concat(_.keys(unset));
  modifiedProperties.forEach(function(fieldName) {
    var field = schema[fieldName];
    if (!field || !userCanUpdateField(currentUser, field, document)) {
      validationErrors.push({
        id: 'errors.disallowed_property_detected',
        properties: { name: fieldName },
      });
    }
  });

  // 2. run SS validation
  const validationContext = collection.simpleSchema().newContext();
  validationContext.validate({ $set: set, $unset: unset }, { modifier: true });

  if (!validationContext.isValid()) {
    const errors = validationContext.validationErrors();
    errors.forEach(error => {
      // eslint-disable-next-line no-console
      // console.log(error);
      if (error.type.includes('intlError')) {
        validationErrors = validationErrors.concat(JSON.parse(error.type.replace('intlError|', '')));
      } else {
        validationErrors.push({
          id: `errors.${error.type}`,
          path: error.name,
          properties: {
            collectionName: collection.options.collectionName,
            typeName: collection.options.typeName,
            ...error,
          },
        });
      }
    });
  }

  return validationErrors;
};

export const validateData = (data, document, collection, context) => {
  return validateModifier(dataToModifier(data), document, collection, context);
};
