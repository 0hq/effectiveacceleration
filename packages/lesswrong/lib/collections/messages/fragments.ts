import { registerFragment } from '../../vulcan-lib/fragments';

registerFragment(`
  fragment messageListFragment on Message {
    _id
    user {
      ...UsersMinimumInfo
    }
    contents {
      html
    }
    createdAt
    conversationId
  }
`);
