import React from "react";
import Users from "../../lib/collections/users/collection";
import { generateEmail } from "../emails";
import { sendEmailSmtp } from "../emails/sendEmail";
import { getCollectionHooks } from "../mutationCallbacks";
import { getSiteUrl } from "../vulcan-lib";

async function newPostNotification(post: DbPost, user: DbUser) {
  const toAddress = "developers+telemetry@progressforum.org";
  const fromAddress = "Progress Forum Telemetry <telemetry@progressforum.org>";
  const subject = `New post by @${user.username}`;
  const emailBody = (
    <div>
      <p>
        New post by {user.displayName} (<a href={getSiteUrl() + `users/` + user.username}>@{user.username}</a>):
      </p>
      <ul>
        <li>
          <a href={getSiteUrl() + "posts/" + post._id}>{post.title}</a>
        </li>
      </ul>
    </div>
  );

  const email = await generateEmail({
    from: fromAddress,
    to: toAddress,
    subject: subject,
    bodyComponent: emailBody,
    user: null,
  });
  await sendEmailSmtp(email);
}

getCollectionHooks("Posts").newAsync.add(async (post: DbPost, user: DbUser) => {
  if (post.draft) {
    return;
  }
  await newPostNotification(post, user);
});

getCollectionHooks("Posts").editAsync.add(async (currentPost: DbPost, oldPost: DbPost) => {
  if (currentPost.draft === false && oldPost.draft === true) {
    const user = await Users.findOne({ _id: currentPost.userId });
    if (!user) {
      return;
    }
    await newPostNotification(currentPost, user);
  }
});

getCollectionHooks("Users").newAsync.add(async (user: DbUser) => {
  const toAddress = "developers+telemetry@progressforum.org";
  const fromAddress = "Progress Forum Telemetry <telemetry@progressforum.org>";
  const subject = `New user @${user.username}`;
  const emailBody = (
    <div>
      <p>
        New user signup, {user.displayName} (<a href={getSiteUrl() + `users/` + user.username}>@{user.username}</a>).
      </p>
    </div>
  );

  const email = await generateEmail({
    from: fromAddress,
    to: toAddress,
    subject: subject,
    bodyComponent: emailBody,
    user: null,
  });
  await sendEmailSmtp(email);
});
