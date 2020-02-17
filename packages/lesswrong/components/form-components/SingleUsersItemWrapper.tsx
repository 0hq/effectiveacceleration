import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useSingle } from '../../lib/crud/withSingle';
import React from 'react';
import Users from '../../lib/collections/users/collection';


const SingleUsersItemWrapper = ({documentId, removeItem, ...props}) => {
  const { document, loading } = useSingle({
    documentId,
    collection: Users,
    fragmentName: 'UsersProfile',
  });
  if (document && !loading) {
    return <span className="search-results-users-item users-item">
      <Components.SingleUsersItem document={document} removeItem={removeItem}/>
    </span>
  } else {
    return <Components.Loading />
  }
};

const SingleUsersItemWrapperComponent = registerComponent('SingleUsersItemWrapper', SingleUsersItemWrapper);

declare global {
  interface ComponentTypes {
    SingleUsersItemWrapper: typeof SingleUsersItemWrapperComponent
  }
}
