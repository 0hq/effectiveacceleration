import React from 'react';
import { getSetting, registerComponent, Components } from '../vulcan-lib';
import { Conversations } from '../../lib/collections/conversations/collection';
import { useCurrentUser } from '../../components/common/withUser';
import * as _ from 'underscore';
import './EmailUsername';
import './EmailFormatDate';
import './EmailContentItemBody';

const styles = theme => ({
  message: {
  },
});

const PrivateMessagesEmail = ({conversations, messages, participantsById, classes}) => {
  if (conversations.length == 1) {
    return <React.Fragment>
      <p>
        You received {messages.length>1 ? "private messages" : "a private message"}.
      </p>
      <Components.PrivateMessagesEmailConversation
        conversation={conversations[0]}
        messages={messages}
        participantsById={participantsById}
      />
    </React.Fragment>
  } else {
    return <React.Fragment>
      <p>
        You received {messages.length} private messages in {conversations.length} conversations.
      </p>
      {conversations.map(conv => <Components.PrivateMessagesEmailConversation
        conversation={conv}
        key={conv._id}
        messages={_.filter(messages, message=>message.conversationId===conv._id)}
        participantsById={participantsById}
      />)}
    </React.Fragment>
  }
}
const PrivateMessagesEmailComponent = registerComponent("PrivateMessagesEmail", PrivateMessagesEmail);

/// A list of users, nicely rendered with links, comma separators and an "and"
/// conjunction between the last two (if there are at least two).
const EmailListOfUsers = ({users}) => {
  const { EmailUsername } = Components;
  
  if (users.length === 0) {
    return <span>nobody</span>;
  } else if(users.length === 1) {
    return <EmailUsername user={users[0]}/>
  } else {
    let result: Array<string|JSX.Element> = [];
    for (let i=0; i<users.length; i++) {
      if (i==users.length-1) result.push(" and ");
      else if (i>0) result.push(", ");
      result.push(<EmailUsername user={users[i]}/>);
    }
    return <span>{result}</span>;
  }
}
const EmailListOfUsersComponent = registerComponent("EmailListOfUsers", EmailListOfUsers);

const PrivateMessagesEmailConversation = ({conversation, messages, participantsById, classes}) => {
  const currentUser = useCurrentUser();
  const { EmailUsername, EmailListOfUsers, EmailFormatDate, EmailContentItemBody } = Components;
  const sitename = getSetting('siteNameWithArticle');
  const conversationLink = Conversations.getPageUrl(conversation, true);
  
  return (<React.Fragment>
    <p>Conversation with{" "}
      <EmailListOfUsers
        users={conversation.participantIds
          .filter(id=>id!==currentUser!._id)
          .map(id=>participantsById[id])
        }
      />
    </p>
    <p><a href={conversationLink}>View this conversation on {sitename}</a>.</p>
    
    {messages.map((message,i) => <div className={classes.message} key={i}>
      <EmailUsername user={participantsById[message.userId]}/>
      {" "}<EmailFormatDate date={message.createdAt}/>
      <EmailContentItemBody dangerouslySetInnerHTML={{__html: message.contents.html}}/>
    </div>)}
  </React.Fragment>);
}

const PrivateMessagesEmailConversationComponent = registerComponent("PrivateMessagesEmailConversation", PrivateMessagesEmailConversation, {styles});

declare global {
  interface ComponentTypes {
    PrivateMessagesEmail: typeof PrivateMessagesEmailComponent,
    EmailListOfUsers: typeof EmailListOfUsersComponent,
    PrivateMessagesEmailConversation: typeof PrivateMessagesEmailConversationComponent,
  }
}
