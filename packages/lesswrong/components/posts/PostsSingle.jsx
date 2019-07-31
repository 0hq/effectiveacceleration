import { Components, registerComponent } from 'meteor/vulcan:core';
import { useLocation } from '../../lib/routeUtil.js';
import React from 'react';

const PostsSingle = () => {
  const { params, query } = useLocation();
  const version = query?.revision;

  console.log(query)
  return <Components.PostsPageWrapper documentId={params._id} sequenceId={null} version={version} />
};

PostsSingle.displayName = "PostsSingle";

registerComponent('PostsSingle', PostsSingle);
