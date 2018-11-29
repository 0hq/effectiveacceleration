import React from 'react';
import { chai } from 'meteor/practicalmeteor:chai';
import chaiAsPromised from 'chai-as-promised';
import { createDummyUser, userUpdateFieldSucceeds, userUpdateFieldFails, catchGraphQLErrors, assertIsPermissionsFlavoredError } from '../../../testing/utils.js'

chai.should();
chai.use(chaiAsPromised);

describe('updateUser – ', async () => {
  let graphQLerrors = catchGraphQLErrors(beforeEach, afterEach);
  it("fails when user updates their displayName", async () => {
    const user = await createDummyUser()
    await userUpdateFieldFails({
      user:user,
      document:user,
      fieldName:'displayName',
      collectionType:'User',
    })
    assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
  it("fails when user updates their createdAt", async () => {
    const user = await createDummyUser()
    await userUpdateFieldFails({
      user:user,
      document:user,
      fieldName:'createdAt',
      collectionType:'User',
      newValue: new Date(),
    })
    // FIXME: This gives an "Unknown field" error instead of a permissions error
    graphQLerrors.getErrors(); // Ignore the wrong-type error
    //assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
  it("fails when sunshineUser updates a user's createdAt", async () => {
    const sunshineUser = await createDummyUser({groups:['sunshineRegiment']})
    const user = await createDummyUser()
    await userUpdateFieldFails({
      user:sunshineUser,
      document:user,
      fieldName:'createdAt',
      collectionType:'User',
      newValue: new Date(),
    })
    // FIXME: This gives an "Unknown field" error instead of a permissions error
    graphQLerrors.getErrors(); // Ignore the wrong-type error
    //assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
  it("fails when user updates their nullifyVotes", async () => {
    const user = await createDummyUser()
    await userUpdateFieldFails({
      user:user,
      document:user,
      fieldName:'nullifyVotes',
      collectionType:'User',
      newValue: false,
    })
    assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
  it("fails when user updates their voteBanned", async () => {
    const user = await createDummyUser()
    await userUpdateFieldFails({
      user:user,
      document:user,
      fieldName:'voteBanned',
      newValue: true,
      collectionType:'User',
    })
    assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
  it("fails when user updates their deleteContent", async () => {
    const user = await createDummyUser()
    await userUpdateFieldFails({
      user:user,
      document:user,
      fieldName:'deleteContent',
      newValue: true,
      collectionType:'User',
    })
    assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
  it("fails when user updates their banned", async () => {
    const user = await createDummyUser()
    await userUpdateFieldFails({
      user:user,
      document:user,
      fieldName:'banned',
      newValue: new Date(),
      collectionType:'User',
    })
    assertIsPermissionsFlavoredError(graphQLerrors.getErrors());
  });
})

describe('updateUser succeeds – ', async () => {
  it("succeeds when user updates their bio", async () => {
    const user = await createDummyUser()
    return userUpdateFieldSucceeds({
      user: user,
      document: user,
      fieldName: 'bio',
      collectionType: 'User',
    })
  });
  it("succeeds when sunshineRegiment user updates their displayName", async () => {
    const user = await createDummyUser({groups:['sunshineRegiment']})
    return userUpdateFieldSucceeds({
      user: user,
      document: user,
      fieldName: 'displayName',
      collectionType: 'User',
    })
  });
  it("succeeds when sunshineRegiment user updates their nullifyVotes", async () => {
    const user = await createDummyUser({groups:['sunshineRegiment']})
    return userUpdateFieldSucceeds({
      user:user,
      document:user,
      fieldName:'nullifyVotes',
      collectionType:'User',
      newValue: true,
    })
  });
  it("succeeds when user updates their voteBanned", async () => {
    const user = await createDummyUser({groups:['sunshineRegiment']})
    return userUpdateFieldSucceeds({
      user:user,
      document:user,
      fieldName:'voteBanned',
      collectionType:'User',
      newValue: true,
    })
  });
  it("succeeds when user updates their deleteContent", async () => {
    const user = await createDummyUser({groups:['sunshineRegiment']})
    return userUpdateFieldSucceeds({
      user:user,
      document:user,
      fieldName:'deleteContent',
      collectionType:'User',
      newValue: true,
    })
  });
})
