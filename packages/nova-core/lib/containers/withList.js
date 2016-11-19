import Telescope from 'meteor/nova:lib';
import React, { PropTypes, Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

export default function withList (options) {

  console.log("withList")
  console.log(options)

  const { queryName, collection, listResolverName, totalResolverName, fragment, fragmentName } = options;

  return graphql(gql`
    query ${queryName}($offset: Int, $limit: Int) {
      ${totalResolverName}
      ${listResolverName}(offset: $offset, limit: $limit) {
        ...${fragmentName}
      }
    }
  `, {
    options(ownProps) {
      return {
        variables: { 
          offset: 0,
          limit: 5
        },
        fragments: fragment,
        pollInterval: 20000,
      };
    },
    props(props) {

      const loading = props.data.loading,
            fetchMore = props.data.fetchMore,
            results = props.data[listResolverName],
            totalCount = props.data[totalResolverName];

      return {
        loading,
        results,
        totalCount,
        count: results && results.length,
        loadMore(event) {
          event.preventDefault();
          // basically, rerun the query 'getPostsList' with a new offset
          return fetchMore({
            variables: { offset: results.length },
            updateQuery(previousResults, { fetchMoreResult }) {
              // no more post to fetch
              if (!fetchMoreResult.data) {
                return previousResults;
              }
              const newResults = {};
              newResults[listResolverName] = [...previousResults[listResolverName], ...fetchMoreResult.data[listResolverName]];
              // return the previous results "augmented" with more
              return {...previousResults, ...newResults };
            },
          });
        },
        ...props.ownProps // pass on the props down to the wrapped component
      };
    },
  });
}