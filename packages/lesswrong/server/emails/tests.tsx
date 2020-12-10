import React from 'react';
import { withSingle, useSingle } from '../../lib/crud/withSingle';
import { chai } from 'meteor/practicalmeteor:chai';
import chaiAsPromised from 'chai-as-promised';
import { createDummyUser, createDummyPost } from '../../testing/utils'
import { emailDoctype, generateEmail } from './renderEmail';
import { withStyles, createStyles } from '@material-ui/core/styles';

chai.should();
chai.use(chaiAsPromised);

const unitTestBoilerplateGenerator = ({css,title,body}: {css: string, title: string, body: string}): string => {
  const styleTag = (css && css.length>0) ? `<style>${css}</style>` : "";
  const html = `${styleTag}<body>${body}</body>`;
  return html;
}

async function renderTestEmail({ user=null, subject="Unit test email", bodyComponent, boilerplateGenerator }: {
  user?: any,
  subject?: string,
  bodyComponent: JSX.Element,
  boilerplateGenerator?: typeof unitTestBoilerplateGenerator
}) {
  return await generateEmail({
    user: user || await createDummyUser(),
    subject: "Unit test email",
    bodyComponent,
    boilerplateGenerator: boilerplateGenerator||unitTestBoilerplateGenerator
  });
}

describe('renderEmail', async () => {
  it("Renders a simple component", async () => {
    const email = await renderTestEmail({
      bodyComponent: <div>Hello</div>,
    });
    
    (email.html as any).should.equal(emailDoctype+'<body><div>Hello</div></body>');
  });
  
  it("Generates a textual representation of the body", async () => {
    const email = await renderTestEmail({
      bodyComponent: <div>Hello</div>,
    });
    
    email.text.should.equal("Hello");
  });
  
  it("Renders styles with withStyles", async () => {
    const styles = createStyles({
      underlined: {
        textDecoration: "underline",
      }
    });
    const StyledComponent = withStyles(styles, {name:"StyledComponent"})(
      ({classes, children}: {classes: any, children: any}) =>
        <div className={classes.underlined}>{children}</div>
    );
    
    
    const email = await renderTestEmail({
      bodyComponent: <div>Hello, <StyledComponent>World</StyledComponent></div>,
    });
    
    (email.html as any).should.equal(emailDoctype+'<body><div>Hello, <div class="StyledComponent-underlined" style="text-decoration: underline;">World</div></div></body>');
  });
  
  it("Can use Apollo HoCs", async () => {
    const user = await createDummyUser();
    const post = await createDummyPost(user, { title: "Email unit test post" });
    
    const PostTitleComponent: any = withSingle({
      collectionName: "Posts",
      fragmentName: 'PostsRevision',
      extraVariables: {
        version: 'String'
      }
    })(
      ({document}) => <div>{document?.title}</div>
    );
    
    const email = await renderTestEmail({
      bodyComponent: <PostTitleComponent documentId={post._id} version={null} />,
    });
    (email.html as any).should.equal(emailDoctype+'<body><div>Email unit test post</div></body>');
  });
  
  it("Can use Apollo hooks", async () => {
    const user = await createDummyUser();
    const post = await createDummyPost(user, { title: "Email unit test post" });
    
    const PostTitleComponent = ({documentId}) => {
      const { document } = useSingle({
        documentId,
        collectionName: "Posts",
        fragmentName: 'PostsRevision',
        extraVariables: {
          version: 'String'
        }
      });
      return <div>{document?.title}</div>
    }
    
    const email = await renderTestEmail({
      bodyComponent: <PostTitleComponent documentId={post._id} />,
    });
    (email.html as any).should.equal(emailDoctype+'<body><div>Email unit test post</div></body>');
  });
  
  /*it("Supports the withCurrentUser HoC", async () => {
    // TODO: Not currently passing
    const user = await createDummyUser();
    
    const MyEmailComponent = withCurrentUser(
      ({currentUser}) => <div>{currentUser && currentUser.email}</div>
    );
    const email = await renderTestEmail({
      bodyComponent: <MyEmailComponent/>,
    });
    email.html.should.equal(emailDoctype+`<body><div>${user.email}</div></body>`);
  });
  
  it("Restricts field accesses based on the current user", async () => {
    // TODO: Not currently passing
    // user1 has a PM. user1 is allowed to see it, user2 isn't.
    const user1 = await createDummyUser();
    const user2 = await createDummyUser();
    const conversation = await createDummyConversation(user1);
    await createDummyMessage(conversation);
    
    const MessagesByConversationComponent = withMulti({
      collection: Messages,
      fragmentName: "messageListFragment",
      ssr: true,
    })(
      ({results}) => <div>{results.map((message, i) => <div key={i}>{message.htmlBody}</div>)}</div>
    );
    const ShowThePMComponent = () =>
      <MessagesByConversationComponent terms={{view: 'messagesConversation', conversationId: conversation._id}} />
    
    const permissionGrantedEmail = await renderTestEmail({
      user: user1,
      bodyComponent: <ShowThePMComponent/>,
    });
    const permissionDeniedEmail = await renderTestEmail({
      user: user2,
      bodyComponent: <ShowThePMComponent/>,
    });
    
    permissionGrantedEmail.html.should.equal(emailDoctype+'<body><div><div>Message body</div></div></body>');
    permissionDeniedEmail.html.should.equal(emailDoctype+'<body><div></div></body>');
  });*/
});
