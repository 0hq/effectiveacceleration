import React from 'react'
import { generateEmail } from '../emails';
import { sendEmailSmtp } from '../emails/sendEmail';
import { getCollectionHooks } from '../mutationCallbacks';
import { getSiteUrl } from '../vulcan-lib';

getCollectionHooks("Posts").newAsync.add(async (post: DbPost, user: DbUser) => {
  if (post.draft) {
    return;
  }

  const toAddress = "developers+telemetry@progressforum.org";
  const fromAddress = "Progress Forum Telemetry <telemetry@progressforum.org>";
  const subject = `New post by @${user.username}`;
  const emailBody = <div>
    <p>New post by {user.displayName} (<a href={getSiteUrl() + `users/` + user.username}>@{user.username}</a>):</p>
    <ul>
      <li><a href={getSiteUrl() + "posts/" + post._id}>{post.title}</a></li>
    </ul>
  </div>;

  const email = await generateEmail({
    from: fromAddress,
    to: toAddress,
    subject: subject,
    bodyComponent: emailBody,
    user: null,
  });
  await sendEmailSmtp(email);
});

getCollectionHooks("Users").newAsync.add(async (user: DbUser) => {
  const toAddress = "developers+telemetry@progressforum.org";
  const fromAddress = "Progress Forum Telemetry <telemetry@progressforum.org>";
  const subject = `New user @${user.username}`;
  const emailBody = <div>
    <p>New user signup, {user.displayName} (<a href={getSiteUrl() + `users/` + user.username}>@{user.username}</a>).</p>
  </div>;

  const email = await generateEmail({
    from: fromAddress,
    to: toAddress,
    subject: subject,
    bodyComponent: emailBody,
    user: null,
  });
  await sendEmailSmtp(email);
});
