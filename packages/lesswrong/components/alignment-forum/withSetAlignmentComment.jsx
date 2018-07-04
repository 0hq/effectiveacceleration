import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { getFragment, getFragmentName } from 'meteor/vulcan:core';

export default function withSetAlignmentComment(options) {

  const fragment = options.fragment || getFragment(options.fragmentName),
        fragmentName = getFragmentName(fragment)

  return graphql(gql`
    mutation alignmentPost($commentId: String, $af: Boolean) {
      alignmentComment(commentId: $commentId, af: $af) {
        ...${fragmentName}
      }
    }
    ${fragment}
  `, {
    alias: 'withSetAlignmentComment',
    props: ({ ownProps, mutate }) => ({
      setAlignmentCommentMutation: (args) => {
        const { commentId, af } = args;
        return mutate({
          variables: { commentId, af }
        });
      }
    }),
  });

}
