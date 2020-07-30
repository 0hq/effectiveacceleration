import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';

const styles = theme => ({
  differences: {
    "& ins": {
      background: "#88ff88",
      textDecoration: "none",
    },
    "& del": {
      background: "#ff8888",
      textDecoration: "none",
    },
  },
});

const CompareRevisions = ({
  collectionName,
  fieldName,
  documentId,
  versionBefore,
  versionAfter,
  classes
}: {
  collectionName: string,
  fieldName: string,
  documentId: string,
  versionBefore: string,
  versionAfter: string,
  classes: ClassesType,
}) => {
  const { ContentItemBody } = Components;
  
  // Use the RevisionsDiff resolver to get a comparison between revisions (see
  // packages/lesswrong/server/resolvers/diffResolvers.ts).
  const { data: diffResult, loading: loadingDiff, error } = useQuery(gql`
    query RevisionsDiff($collectionName: String, $fieldName: String, $id: String, $beforeRev: String, $afterRev: String) {
      RevisionsDiff(collectionName: $collectionName, fieldName: $fieldName, id: $id, beforeRev: $beforeRev, afterRev: $afterRev)
    }
  `, {
    variables: {
      collectionName: collectionName,
      fieldName: fieldName,
      id: documentId,
      beforeRev: versionBefore,
      afterRev: versionAfter,
    },
    ssr: true,
  });
  
  if (error) {
    return <Components.ErrorMessage message={error.message}/>
  }
  
  if (loadingDiff)
    return <Components.Loading/>
  
  const diffResultHtml = diffResult?.RevisionsDiff;
  return (
    <div className={classes.differences}>
      <ContentItemBody dangerouslySetInnerHTML={{__html: diffResultHtml}}/>
    </div>
  );
}


const CompareRevisionsComponent = registerComponent("CompareRevisions", CompareRevisions, {styles});

declare global {
  interface ComponentTypes {
    CompareRevisions: typeof CompareRevisionsComponent
  }
}
