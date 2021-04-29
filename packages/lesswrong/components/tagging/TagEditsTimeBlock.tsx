import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useQuery, gql } from '@apollo/client';
import { useMulti } from '../../lib/crud/withMulti';
import { fragmentTextForQuery } from '../../lib/vulcan-lib/fragments';
import withErrorBoundary from '../common/withErrorBoundary'

const styles = (theme: ThemeType): JssStyles => ({
  root: {
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 6
  },
});

const TagEditsTimeBlock = ({before, after, classes}: {
  before: string,
  after: string,
  classes: ClassesType
}) => {
  const { ContentType, SingleLineTagUpdates } = Components;
  const { data, loading } = useQuery(gql`
    query getTagUpdates($before: Date!, $after: Date!) {
      TagUpdatesInTimeBlock(before: $before, after: $after) {
        tag {
          ...TagBasicInfo
        }
        revisionIds
        commentCount
        commentIds
        lastRevisedAt
        lastCommentedAt
        added
        removed
      }
    }
    ${fragmentTextForQuery('TagBasicInfo')}
  `, {
    variables: {
      before, after,
    },
    ssr: true,
  });
  if (!data?.TagUpdatesInTimeBlock?.length)
    return null;
  return <div className={classes.root}>
    <div className={classes.subtitle}>
      <ContentType type="tags" label="Wiki/Tag Page Edits and Discussion"/>
    </div>
    {data.TagUpdatesInTimeBlock.map(tagUpdates => <SingleLineTagUpdates
      key={tagUpdates.tag._id}
      tag={tagUpdates.tag}
      revisionCount={tagUpdates.revisionIds.length}
      revisionIds={tagUpdates.revisionIds}
      commentIds={tagUpdates.commentIds}
      commentCount={tagUpdates.commentCount}
      changeMetrics={{added: tagUpdates.added, removed: tagUpdates.removed}}
      before={before}
      after={after}
    />)}
  </div>
}

const TagEditsTimeBlockComponent = registerComponent('TagEditsTimeBlock', TagEditsTimeBlock, {
  styles, hocs: [withErrorBoundary]
});

declare global {
  interface ComponentTypes {
    TagEditsTimeBlock: typeof TagEditsTimeBlockComponent
  }
}
