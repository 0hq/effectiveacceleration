import React, { useCallback, useState } from 'react';
import { Components, registerComponent, getFragment } from '../../lib/vulcan-lib';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { useTracking } from "../../lib/analyticsEvents";
import SearchIcon from '@material-ui/icons/Search';
import AddBoxIcon from '@material-ui/icons/AddBox';
import classNames from 'classnames';
import { useMessages } from '../common/withMessages';

const styles = theme => ({
  root: {
    width: 94,
    transition: ".25s",
    display: "flex",
    cursor: "pointer"
  },
  open: {
    width: 300,
    cursor: "unset",
    [theme.breakpoints.down('xs')]: {
      width: "100%"
    }
  },
  icon: {
    height: 18,
    marginTop: 2,
    marginRight: 3,
    color: theme.palette.grey[500]
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
  const [mutate] = useMutation(gql`
  mutation addOrUpvoteTag($tagId: String, $postId: String) {
    addOrUpvoteTag(tagId: $tagId, postId: $postId) {
      ...TagRelMinimumFragment
    }
  }
    ${getFragment("TagRelMinimumFragment")}
  `);

  const onPostSelected = useCallback(async (postId) => {
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
  }, [mutate, flash, tag._id, tag.name, captureEvent]);

  const { PostsSearchAutoComplete, Loading } = Components
  return <div className={classNames(classes.root, {[classes.open]: searchOpen})} onClick={() => setSearchOpen(true)} onBlur={() => setSearchOpen(false)}>
    {searchOpen && <SearchIcon className={classes.icon}/>}
    {isAwaiting 
      ? <Loading/> 
      : <>
          <AddBoxIcon className={classes.icon}/>
          <PostsSearchAutoComplete 
            clickAction={onPostSelected} 
            placeholder={searchOpen ? "Search for posts" : "Add Posts"}
          />
        </>
    }
  </div>
}

const AddPostsToTagComponent = registerComponent("AddPostsToTag", AddPostsToTag, {styles})

declare global {
  interface ComponentTypes {
    AddPostsToTag: typeof AddPostsToTagComponent
  }
}

