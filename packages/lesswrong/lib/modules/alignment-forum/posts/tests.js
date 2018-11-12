import React from 'react';
import { chai } from 'meteor/practicalmeteor:chai';
import chaiAsPromised from 'chai-as-promised';
import { runQuery } from 'meteor/vulcan:core';
import { createDummyUser, createDummyPost, catchGraphQLErrors, assertIsPermissionsFlavoredError } from '../../../../testing/utils.js'

chai.should();
chai.use(chaiAsPromised);

describe('AlignmentForum PostsEdit', async () => {
  let graphQLerrors = catchGraphQLErrors();
  
  it("fails when an alignmentForum user edits a post title", async () => {
    const user = await createDummyUser({groups:['alignmentForum']})
    const post = await createDummyPost()

    const newTitle = "New Test Title"

    const query = `
      mutation PostsEdit {
        updatePost(selector: {_id:"${post._id}"},,data:{title:"${newTitle}"}) {
          data {
            title
          }
        }
      }
    `;
    const response = runQuery(query,{},{currentUser:user})
    await response.should.be.rejected;
    assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
  it("fails when an alignmentForum user edits a post's content field", async () => {
    const user = await createDummyUser({groups:['alignmentForum']})
    const post = await createDummyPost()

    const newContent = "New Test Title"

    const query = `
      mutation PostsEdit {
        updatePost(selector: {_id:"${post._id}"},,data:{content:"${newContent}"}) {
          data {
            title
          }
        }
      }
    `;
    const response = runQuery(query,{},{currentUser:user})
    await response.should.be.rejected;
    assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
  it("succeeds when alignmentForum user edits the suggestForAlignmentUserIds field", async () => {
    const user = await createDummyUser({groups:['alignmentForum']})
    const post = await createDummyPost()

    const userIds = user._id

    const query = `
      mutation PostsEdit {
        updatePost(selector: {_id:"${post._id}"},data:{suggestForAlignmentUserIds:["${userIds}"]}) {
          data {
            suggestForAlignmentUserIds
          }
        }
      }
    `;
    const response = runQuery(query,{},{currentUser:user})
    const expectedOutput = { data: { updatePost: { data: {suggestForAlignmentUserIds: [`${userIds}`] } } } }
    return response.should.eventually.deep.equal(expectedOutput);
  });
  it("succeeds when alignmentForumAdmin edits the suggestForAlignmentUserIds field", async () => {
    const user = await createDummyUser({groups:['alignmentForumAdmins']})
    const post = await createDummyPost()

    const userIds = user._id

    const query = `
      mutation PostsEdit {
        updatePost(selector: {_id:"${post._id}"},data:{suggestForAlignmentUserIds:["${userIds}"]}) {
          data {
            suggestForAlignmentUserIds
          }
        }
      }
    `;
    const response = runQuery(query,{},{currentUser:user})
    const expectedOutput = { data: { updatePost: { data: {suggestForAlignmentUserIds: [`${userIds}`] } } } }
    return response.should.eventually.deep.equal(expectedOutput);
  });
  it("fails when alignmentForum user edits the reviewForAlignmentUserId field", async () => {
    const user = await createDummyUser({groups:['alignmentForum']})
    const post = await createDummyPost()

    const query = `
      mutation PostsEdit {
        updatePost(selector: {_id:"${post._id}"},data:{reviewForAlignmentUserId:"${user._id}"}) {
          data {
            reviewForAlignmentUserId
          }
        }
      }
    `;
    const response = runQuery(query,{},{currentUser:user})
    await response.should.be.rejected;
    assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
  it("succeeds when alignmentForumAdmin edits the reviewForAlignmentUserId field", async () => {
    const user = await createDummyUser({groups:['alignmentForumAdmins']})
    const post = await createDummyPost()

    const query = `
      mutation PostsEdit {
        updatePost(selector: {_id:"${post._id}"},data:{reviewForAlignmentUserId:"${user._id}"}) {
          data {
            reviewForAlignmentUserId
          }
        }
      }
    `;
    const response = runQuery(query,{},{currentUser:user})
    const expectedOutput = { data: { updatePost: { data: { reviewForAlignmentUserId: `${user._id}` } } } }
    return response.should.eventually.deep.equal(expectedOutput);
  });
})
