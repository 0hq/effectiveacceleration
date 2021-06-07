import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useMulti } from '../../lib/crud/withMulti';
import withErrorBoundary from '../common/withErrorBoundary'

const styles = (theme: ThemeType): JssStyles => ({
  root: {
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 6
  },
  wikiEmpty: {
    marginLeft: theme.spacing.unit,
    fontStyle: "italic",
    color: theme.palette.grey[500]
  }
});


const TagEditsByUser = ({userId, limit, classes}: {
  userId: string,
  limit: number,
  classes: ClassesType
}) => {

  const { loadingInitial, loadMoreProps, results } = useMulti({
    terms: {view: "revisionsByUser", userId, limit},
    collectionName: "Revisions",
    fragmentName: 'RevisionTagFragment',
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-only",
  });

  if (loadingInitial || !results) {
    return <Components.Loading />
  }

  if (!loadingInitial && (!results || results.length === 0))
    return (<Components.Typography variant="body2" className={classes.wikiEmpty}>No wiki contributions to display.</Components.Typography>)

  return <div className={classes.root}>
    {results.filter(elm => !!elm.tag).map(tagUpdates => <Components.SingleLineTagUpdates
      key={tagUpdates.documentId + " " + tagUpdates.editedAt}
      tag={tagUpdates.tag!}
      revisionIds={[tagUpdates._id]}
      changeMetrics={{added: tagUpdates.changeMetrics.added, removed: tagUpdates.changeMetrics.removed}}
      lastRevisedAt={tagUpdates.editedAt}
    />)}
    <Components.LoadMore {...loadMoreProps} />
  </div>
}

const TagEditsByUserComponent = registerComponent('TagEditsByUser', TagEditsByUser, {
  styles, hocs: [withErrorBoundary]
});

declare global {
  interface ComponentTypes {
    TagEditsByUser: typeof TagEditsByUserComponent
  }
}
