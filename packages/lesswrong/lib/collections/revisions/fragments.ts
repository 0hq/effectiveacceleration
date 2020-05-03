import { registerFragment } from '../../vulcan-lib';

registerFragment(`
  fragment RevisionMetadata on Revision {
    version
    editedAt
    commitMessage
    userId
  }
`);

registerFragment(`
  fragment RevisionMetadataWithChangeMetrics on Revision {
    ...RevisionMetadata
    changeMetrics
  }
`);
