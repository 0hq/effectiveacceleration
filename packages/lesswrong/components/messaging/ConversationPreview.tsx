import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useSingle } from '../../lib/crud/withSingle';
import { useMulti } from '../../lib/crud/withMulti';
import Messages from "../../lib/collections/messages/collection";
import Conversations from '../../lib/collections/conversations/collection';
import Card from '@material-ui/core/Card';
import { useCurrentUser } from '../common/withUser';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit,
    width: 500,
    [theme.breakpoints.down('xs')]: {
      display: "none"
    },
  },
  title: {
    ...theme.typography.body2,
    ...theme.typography.commentStyle,
    marginBottom: theme.spacing.unit
  }
})

const ConversationPreview = ({classes, conversationId}) => {
  const currentUser = useCurrentUser();
  const { Loading, MessageItem } = Components

  const { document: conversation, loading: conversationLoading } = useSingle({
    collection: Conversations,
    fragmentName: 'conversationsListFragment',
    fetchPolicy: 'cache-then-network' as any, //TODO
    documentId: conversationId
  });

  const { results: messages = [] } = useMulti({
    terms: {
      view: 'conversationPreview', 
      conversationId: conversationId
    },
    collection: Messages,
    fragmentName: 'messageListFragment',
    fetchPolicy: 'cache-and-network',
    limit: 10,
    ssr: true
  });
  
  // using a spread operator instead of naively "messages.reverse()" to avoid modifying the 
  // original array, which coud cause rendering bugs (reversing the order every time the component re-renders)
  const reversedMessages = [...messages].reverse()

  return <Card className={classes.root}>
    { conversation && <div className={classes.title}>{ Conversations.getTitle(conversation, currentUser) }</div>}
    { conversationLoading && <Loading />}
    
    { conversation && reversedMessages.map((message) => (<MessageItem key={message._id} message={message} />))}
  </Card>
}

const ConversationPreviewComponent = registerComponent('ConversationPreview', ConversationPreview, {styles});

declare global {
  interface ComponentTypes {
    ConversationPreview: typeof ConversationPreviewComponent
  }
}

