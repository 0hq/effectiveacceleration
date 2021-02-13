import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib'
import { getAlgoliaIndexName } from '../../lib/algoliaUtil';

const PostsSearchAutoComplete = ({clickAction, placeholder='Search for posts'}:{
  clickAction: any,
  placeholder?: string
}) => {
  return <Components.SearchAutoComplete
    indexName={getAlgoliaIndexName("Posts")}
    clickAction={clickAction}
    renderSuggestion={hit => <Components.PostsListEditorSearchHit hit={hit} />}
    placeholder={placeholder}
    noSearchPlaceholder='Post ID'
  />
}

const PostsSearchAutoCompleteComponent = registerComponent("PostsSearchAutoComplete", PostsSearchAutoComplete);

declare global {
  interface ComponentTypes {
    PostsSearchAutoComplete: typeof PostsSearchAutoCompleteComponent
  }
}

