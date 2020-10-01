import React, { useCallback, useState } from 'react';
import { Components, registerComponent, getFragment } from '../../lib/vulcan-lib';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { useTracking } from "../../lib/analyticsEvents";
import AddBoxIcon from '@material-ui/icons/AddBox';
import classNames from 'classnames';
import { useMessages } from '../common/withMessages';
import { handleUpdateMutation, updateEachQueryResultOfType } from '../../lib/crud/cacheUpdates';
import { InstantSearch, SearchBox, Configure, Hits } from 'react-instantsearch-dom';
import { algoliaIndexNames, getSearchClient } from '../../lib/algoliaUtil';
import { useCurrentUser } from '../common/withUser';
import { useDialog } from '../common/withDialog';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    display: "flex",
    '& input': {
      width: 70,
      cursor: "pointer"
    }
  },
  open: {
    width: "100%",
    '& input': {
      width: "calc(100% - 15px)",
      cursor: "unset"
    },
    backgroundColor: "white",
    padding: 8
  },
  icon: {
    height: 18,
    marginTop: 2,
    marginRight: 3,
    color: theme.palette.grey[500]
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8
  },
  search: {
    display: 'flex',
    flexDirection: 'column',
    width: "100%"
  },
  searchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    // For some reason the pagination current page item is misaligned when we don't do it. 
    // Maybe worth looking into why this is the case some other time.
    '& .ais-Pagination-item--selected.ais-Pagination-item--page': {
      position: 'relative',
      bottom: 3
    }
  },
  closeIcon: {
    fontSize: '16px',
    color: 'black',
    cursor: 'pointer'
  },
  addButton: {
    cursor: 'pointer',
    alignItems: 'center',
    color: 'rgba(0,0,0,0.6)',
    display: 'flex'
  },
  postHit: {
    cursor: "pointer"
  }
});



const AddPostsToTag = ({classes, tag}: {
  classes: ClassesType,
  tag: TagPreviewFragment
}) => {
  const [isAwaiting, setIsAwaiting] = useState(false);
  const { captureEvent } = useTracking()
  const { flash } = useMessages()
  const [ searchOpen, setSearchOpen ] = useState(false)  
  const currentUser = useCurrentUser();
  const { openDialog } = useDialog();
  const [mutate] = useMutation(gql`
    mutation addOrUpvoteTag($tagId: String, $postId: String) {
      addOrUpvoteTag(tagId: $tagId, postId: $postId) {
        ...TagRelCreationFragment
      }
    }
    ${getFragment("TagRelCreationFragment")}
  `, {
    update(cache, { data: {addOrUpvoteTag: TagRel}  }) {
      updateEachQueryResultOfType({ func: handleUpdateMutation, store: cache, typeName: "Post",  document: TagRel.post })
    }
  });

  const onPostSelected = useCallback(async (postId) => {
    if (!currentUser) {
      openDialog({
        componentName: "LoginPopup",
        componentProps: {}
      });
      return
    }
    setIsAwaiting(true)
    await mutate({
      variables: {
        tagId: tag._id,
        postId: postId,
      },
    });    
    setIsAwaiting(false)
    flash({messageString: `Tagged post with '${tag.name}'`, type: "success"})
    captureEvent("tagAddedToItem", {tagId: tag._id, tagName: tag.name})
  }, [mutate, flash, tag._id, tag.name, captureEvent, openDialog, currentUser]);

  const { SearchPagination, PostsListEditorSearchHit } = Components
  return <div className={classNames(classes.root, {[classes.open]: searchOpen})}>
    {!searchOpen && !isAwaiting && <span 
      onClick={() => setSearchOpen(true)}
      className={classes.addButton}
    >
      <AddBoxIcon className={classes.icon}/> Add Posts
    </span> }
    {searchOpen && <div className={classes.search}>
      <InstantSearch
        indexName={algoliaIndexNames.Posts}
        searchClient={getSearchClient()}
      > 
        <div className={classes.searchHeader}>
          <div className={classes.searchBar}>
            {/* Ignored because SearchBox is incorrectly annotated as not taking null for its reset prop, when
              * null is the only option that actually suppresses the extra X button.
            // @ts-ignore */}
            <SearchBox focusShortcuts={[]} autoFocus={true} reset={null} />
            <CloseIcon className={classes.closeIcon} onClick={() => setSearchOpen(false)}/>
          </div>
          <SearchPagination />
        </div>
        <Configure
          facetFilters={`tags:-zxmLyuTr7nujF523s`}
          hitsPerPage={10}
        />
        <Hits hitComponent={({hit}: {hit: any}) => <span className={classes.postHit} onClick={() => onPostSelected(hit._id)}>
          <PostsListEditorSearchHit hit={hit} />
        </span>} />
      </InstantSearch>
    </div>}
  </div>
}

const AddPostsToTagComponent = registerComponent("AddPostsToTag", AddPostsToTag, {styles})

declare global {
  interface ComponentTypes {
    AddPostsToTag: typeof AddPostsToTagComponent
  }
}

