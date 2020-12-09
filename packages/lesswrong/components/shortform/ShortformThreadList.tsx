import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useMulti } from '../../lib/crud/withMulti';

const styles = (theme: ThemeType): JssStyles => ({
  shortformItem: {
    marginTop: theme.spacing.unit*4
  }
})

const ShortformThreadList = ({ classes }: {
  classes: ClassesType,
}) => {
  const { LoadMore, CommentWithReplies, ShortformSubmitForm, Loading } = Components
  const { results, loading, loadMoreProps, refetch } = useMulti({
    terms: {
      view: 'shortform',
      limit:20
    },
    collectionName: "Comments",
    fragmentName: 'CommentWithRepliesFragment',
    fetchPolicy: 'cache-and-network',
    enableTotal: false,
    pollInterval: 0,
  });

  return (
    <div>
      <ShortformSubmitForm successCallback={refetch} />
      
      {results && results.map((comment, i) => {
        if (!comment.post) return null
        return <div key={comment._id} className={classes.shortformItem}>
          <CommentWithReplies comment={comment} post={comment.post} refetch={refetch}/>
        </div>
      })}
      <LoadMore {...loadMoreProps} />
      {loading && <Loading/>}
    </div>
  )
}

const ShortformThreadListComponent = registerComponent('ShortformThreadList', ShortformThreadList, {styles});

declare global {
  interface ComponentTypes {
    ShortformThreadList: typeof ShortformThreadListComponent
  }
}

