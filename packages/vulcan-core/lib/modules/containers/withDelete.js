/*

Generic mutation wrapper to remove a document from a collection.

Sample mutation:

  mutation deleteMovie($input: DeleteMovieInput) {
    deleteMovie(input: $input) {
      data {
        _id
        name
        __typename
      }
      __typename
    }
  }

Arguments:

  - input
    - input.selector: the id of the document to remove

Child Props:

  - deleteMovie({ selector })

*/

import React from 'react';
import gql from 'graphql-tag';
import { deleteClientTemplate } from 'meteor/vulcan:core';
import { extractCollectionInfo, extractFragmentInfo } from 'meteor/vulcan:lib';
import { compose, withHandlers } from 'recompose';
import { cacheUpdateGenerator } from './cacheUpdates';
import { getExtraVariables } from './utils'
import { Mutation } from 'react-apollo';

const withDelete = options => {
  const { collectionName, collection } = extractCollectionInfo(options);
  const { fragmentName, fragment, extraVariablesString } = extractFragmentInfo(options, collectionName);

  const typeName = collection.options.typeName;
  const query = gql`
    ${deleteClientTemplate({ typeName, fragmentName, extraVariablesString })}
    ${fragment}
  `;

  const mutationWrapper = (Component) => (props) => (
    <Mutation mutation={query}>
      {(mutate, { data }) => (
        <Component
          {...props}
          mutate={mutate}
          ownProps={props}
        />
      )}
    </Mutation>
  )

  // wrap component with graphql HoC
  return compose(
    mutationWrapper,
    withHandlers({
      [`delete${typeName}`]: ({ mutate, ownProps }) => ({ selector }) => {
        const extraVariables = getExtraVariables(ownProps, options.extraVariables)
        return mutate({
          variables: { selector, ...extraVariables },
          update: cacheUpdateGenerator(typeName, 'delete')
        });
      },
    })
  )
};

export default withDelete;
