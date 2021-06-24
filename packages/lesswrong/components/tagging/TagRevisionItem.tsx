import React, {useState} from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import withErrorBoundary from '../common/withErrorBoundary'
import { commentBodyStyles } from '../../themes/stylePiping'

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    background: "white",
    border: `solid 1px ${theme.palette.commentBorderGrey}`,
    padding: 12,
    borderRadius:3,
    marginBottom: 16,
  },
  textBody: {
    ...commentBodyStyles(theme),
  },
  discussionButtonPositioning: {
    display: "flex",
    marginTop: "3px"
  }
});

const TagRevisionItem = ({tag, collapsed=false, headingStyle, revision, previousRevision, documentId, classes}: {
  tag: TagBasicInfo,
  collapsed?: boolean,
  headingStyle: "full"|"abridged",
  revision: RevisionMetadataWithChangeMetrics,
  previousRevision?: RevisionMetadataWithChangeMetrics
  documentId: string,
  classes: ClassesType,
}) => {
  const { CompareRevisions, TagRevisionItemFullMetadata, TagRevisionItemShortMetadata, TagDiscussionButton } = Components
  const [expanded, setExpanded] = useState(false);
  if (!documentId || !revision) return null
  const { added, removed } = revision.changeMetrics;
  
  if (collapsed && !expanded) {
    return <Components.SingleLineFeedEvent expands setExpanded={setExpanded}>
      <TagRevisionItemShortMetadata tag={tag} revision={revision} />
    </Components.SingleLineFeedEvent>
  }

  return <div className={classes.root}>
    {headingStyle==="full" &&
      <TagRevisionItemFullMetadata tag={tag} revision={revision} />}
    {headingStyle==="abridged" &&
      <div><TagRevisionItemShortMetadata tag={tag} revision={revision} /></div>}
    
    {!!(added || removed || !previousRevision) && <div className={classes.textBody}>
      <CompareRevisions
        trim={true}
        collectionName="Tags" fieldName="description"
        documentId={documentId}
        versionBefore={previousRevision?.version||null}
        versionAfter={revision.version}
      />
    </div>}
    <div className={classes.discussionButtonPositioning}>
      <TagDiscussionButton tag={tag} text={`Discuss this ${tag.wikiOnly ? "wiki" : "tag"}`}/>
    </div>
  </div>
}

const TagRevisionItemComponent = registerComponent("TagRevisionItem", TagRevisionItem, {styles, hocs: [withErrorBoundary]});

declare global {
  interface ComponentTypes {
    TagRevisionItem: typeof TagRevisionItemComponent
  }
}
