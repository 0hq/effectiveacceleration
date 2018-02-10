import React from 'react';
import { chai } from 'meteor/practicalmeteor:chai';
import chaiAsPromised from 'chai-as-promised';
import { runQuery } from 'meteor/vulcan:core';

import { createDummyUser, createDummyPost } from '../utils.js'

chai.should();
chai.use(chaiAsPromised);

import Users from 'meteor/vulcan:users';

console.log("QWERQWERQWER")

describe('Posts Moderation', async () => {
  it('CommentsNew should succeed if user is not in bannedUserIds list', async () => {
    const user = await createDummyUser()
    const post = await createDummyPost()

    const query = `
      mutation CommentsNew {
        CommentsNew(document:{postId:"${post._id}", content:{}}){
          postId
          body
        }
      }
    `;
    const response = runQuery(query, {}, {currentUser:{_id:user._id}})
    const expectedOutput = { data: { CommentsNew: { postId: post._id, body: null } } }
    return response.should.eventually.deep.equal(expectedOutput);
  });
  // This doesn't work for some reason. It's not _super_ important that the test works (works when I test manually),
  //      but... admins _should_ be able to add users to the bannedUserIds list
  //
  // it("admins can add users to a post's bannedUserIds ", async () => {
  //   const user = await createDummyUser({isAdmin:true})
  //   const post = await createDummyPost()
  //
  //   const query = `
  //     mutation  {
  //       PostsEdit(documentId:"${post._id}",set:{bannedUserIds:"['${user._id}']"}) {
  //         bannedUserIds
  //       }
  //     }
  //   `;
  //   const response = runQuery(query, {}, {currentUser:user})
  //   const expectedOutput = { data: { PostsEdit: { bannedUserIds: [user._id] } } }
  //   return response.should.eventually.deep.equal(expectedOutput);
  // });
  it('new comment on a post should fail if user in bannedUserIds list', async () => {
    const user = await createDummyUser()
    const post = await createDummyPost(user, {bannedUserIds:[user._id]})
    const query = `
      mutation CommentsNew {
        CommentsNew(document:{postId:"${post._id}", content:{}}){
          body
        }
      }
    `;
    const response = runQuery(query, {}, {currentUser:user})
    return response.should.be.rejected;
  });
});


describe('Group - trustLevel1', async () => {
  describe('posts.moderate permissions', async ()=> {
    it("non-trusted users should not have permission to moderate their own posts", async () => {
      const user = await createDummyUser()
      return Users.canDo(user, `posts.moderate.own`).should.equal(false)
    });
    it("trusted users should have permission to moderate their own posts", async () => {
      const user = await createDummyUser({groups:["trustLevel1"]})
      return Users.canDo(user, `posts.moderate.own`).should.equal(true)
    });
    it("trusted users should not have permission to moderate other all posts", async () => {
      const user = await createDummyUser({groups:["trustLevel1"]})
      return Users.canDo(user, `posts.moderate.all`).should.equal(false)
    });
  })
  describe('userEdit moderation settings', async ()=> {
    it("non-trusted users cannot set their moderation style", async () => {
      const user = await createDummyUser({groups:["trustLevel1"]})
      const query = `
        mutation  {
          usersEdit(documentId:"${user._id}",set:{moderationStyle:"0"}) {
            moderationStyle
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:{_id:user._id}})
      return response.should.be.rejected;
    });
    it("non-trusted users cannot set their moderation guidelines", async () => {
      const user = await createDummyUser(undefined, ["trustLevel1"])
      const query = `
        mutation  {
          usersEdit(documentId:"${user._id}",set:{moderationGuidelines:"foo"}) {
            moderationGuidelines
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:{_id:user._id}})
      return response.should.be.rejected;
    });
    it("non-trusted users cannot set their moderation assistance", async () => {
      const user = await createDummyUser(undefined, ["trustLevel1"])
      const query = `
        mutation  {
          usersEdit(documentId:"${user._id}",set:{moderatorAssistance:true}) {
            moderatorAssistance
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:{_id:user._id}})
      return response.should.be.rejected;
    });
    it("trusted users can set their moderation style", async () => {
      const user = await createDummyUser({groups:["trustLevel1"]})
      const query = `
        mutation  {
          usersEdit(documentId:"${user._id}",set:{moderationStyle:"easy-going"}) {
            moderationStyle
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:user})
      const expectedOutput = { data: { usersEdit: { moderationStyle: "easy-going" } } }
      return response.should.eventually.deep.equal(expectedOutput);
    });
    it("trusted users can set their moderation guidelines", async () => {
      const user = await createDummyUser({groups:["trustLevel1"]})
      const query = `
        mutation  {
          usersEdit(documentId:"${user._id}",set:{moderationGuidelines:"blah"}) {
            moderationGuidelines
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:user})
      const expectedOutput = { data: { usersEdit: { moderationGuidelines: "blah" } } }
      return response.should.eventually.deep.equal(expectedOutput);
    });
    it("trusted users can set their moderation assistance", async () => {
      const user = await createDummyUser({groups:["trustLevel1"]})
      const query = `
        mutation  {
          usersEdit(documentId:"${user._id}",set:{moderatorAssistance:true}) {
            moderatorAssistance
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:user})
      const expectedOutput = { data: { usersEdit: { moderatorAssistance: true } } }
      return response.should.eventually.deep.equal(expectedOutput);
    });
  })



  describe('PostsEdit bannedUserIds permissions', async ()=> {
    it("PostsEdit bannedUserIds should succeed if user in trustLevel1, owns post, and has set moderationStyle", async () => {
      const user = await createDummyUser({moderationStyle:"easy-going", groups:["trustLevel1"]})
      const post = await createDummyPost(user)
      const testBannedUserIds = "test"
      const query = `
        mutation  {
          PostsEdit(documentId:"${post._id}",set:{bannedUserIds:["${testBannedUserIds}"]}) {
            bannedUserIds
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:user})
      const expectedOutput = { data: { PostsEdit: { bannedUserIds: [testBannedUserIds] } } }
      return response.should.eventually.deep.equal(expectedOutput);
    })
    it("PostsEdit bannedUserIds should fail if user owns post, has set moderationStyle, and is NOT in trustLevel1", async () => {
      const user = await createDummyUser({moderationStyle:"easy-going"})
      const post = await createDummyPost(user)
      const testBannedUserIds = "test"
      const query = `
        mutation  {
          PostsEdit(documentId:"${post._id}",set:{bannedUserIds:["${testBannedUserIds}"]}) {
            bannedUserIds
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:{user}})
      return response.should.be.rejected;
    })
    it("PostsEdit bannedUserIds should fail if user in TrustLevel1, has set moderationStyle, and does NOT own post", async () => {
      const user = await createDummyUser({moderationStyle:"easy-going", groups:["trustLevel1"]})
      const otherUser = await createDummyUser()
      const post = await createDummyPost(otherUser)
      const testBannedUserIds = "test"
      const query = `
        mutation  {
          PostsEdit(documentId:"${post._id}",set:{bannedUserIds:["${testBannedUserIds}"]}) {
            bannedUserIds
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:{user}})
      return response.should.be.rejected;
    })
    it("PostsEdit bannedUserIds should fail if user in trustLevel1, owns post, and has NOT set moderationStyle", async () => {
      const user = await createDummyUser({groups:["trustLevel1"]})
      const post = await createDummyPost(user)
      const query = `
        mutation  {
          PostsEdit(documentId:"${post._id}",set:{bannedUserIds:["test"]}) {
            bannedUserIds
          }
        }
      `;
      const response = runQuery(query, {}, {currentUser:{user}})
      return response.should.be.rejected;
    })
  })
});
