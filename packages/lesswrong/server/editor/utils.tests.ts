import { createDummyPost, createDummyUser } from "../../testing/utils";
import { testStartup } from "../../testing/testMain";
import Revisions from "../../lib/collections/revisions/collection";
import { Posts } from "../../lib/collections/posts";
import { runQuery } from "../vulcan-lib";
import { syncDocumentWithLatestRevision } from "./utils";

testStartup();

async function updatePost(user: DbUser, postId: string, newMarkup: string) {
  const query = `
    mutation PostsEdit {
      updatePost(
        selector: {_id:"${postId}"},
        data: {contents: {originalContents: {type: "ckEditorMarkup", data: "${newMarkup}"}}}
      ) {
        data {
          commentsLocked
        }
      }
    }
  `
  await runQuery(query, {}, {currentUser: user})
}

describe("syncDocumentWithLatestRevision", () => {
  it("updates with the latest revision", async () => {
    const user = await createDummyUser()
    const post = await createDummyPost(user, {
      contents: {
        originalContents: {
          type: 'ckEditorMarkup',
          data: '<p>Post version 1</p>'
        }
      }
    })

    await updatePost(user, post._id, '<p>Post version 2</p>')
    await updatePost(user, post._id, '<p>Post version 3</p>')

    const revisions = await Revisions.find({documentId: post._id}, {sort: {createdAt: 1}}).fetch()
    const lastRevision = revisions[2]
    if (!lastRevision) {
      throw new Error("Didn't create the expected number of revisions")
    }
    await Revisions.remove({_id: lastRevision._id})
    
    // Function we're actually testing
    await syncDocumentWithLatestRevision(Posts, post, 'contents')

    const postAfterSync = await Posts.findOne({_id: post._id})
    if (!postAfterSync) {
      throw new Error("Lost post")
    }
    expect(postAfterSync.contents.originalContents.data).toMatch(/version 2/);
  });
});
