import { newMutation } from 'meteor/vulcan:core';
import Users from 'meteor/vulcan:users';
import { Posts } from '../lib/collections/posts'
import { Comments } from '../lib/collections/comments'
import Conversations from '../lib/collections/conversations/collection.js';
import Messages from '../lib/collections/messages/collection.js';
import {ContentState, convertToRaw} from 'draft-js';
import { Random } from 'meteor/random';
import { runQuery } from 'meteor/vulcan:core';
import { setOnGraphQLError } from 'meteor/vulcan:lib';


// Hooks Vulcan's runGraphQL to handle errors differently. By default, Vulcan
// would dump errors to stderr; instead, we want to (a) suppress that output,
// (b) assert that particular errors are present in unit tests, and (c) if no
// error was asserted to be present, assert that there were no errors.
//
// This should be called in unit tests from inside describe() but outside of
// it(). For example:
//
//   describe('Thing that uses GraphQL', async () => {
//     let graphQLErrorCatcher = catchGraphQLErrors();
//
//     it('produces a permission-denied error', async () => {
//       // Do a thing that produces an error
//
//       graphQLErrorCatcher.getErrors().should.equal(["app.mutation_not_allowed"]);
//     })
//
//     it('does not produce errors', async () => {
//       // Do a thing that should not produce errors
//       // Because this test does not interact with graphQLErrorCatcher, when
//       // it returns, it will implicitly assert that there were no errors.
//     })
//   });
export const catchGraphQLErrors = function(before, after) {
  class ErrorCatcher {
    constructor() {
      this.errors = [];
      this.errorsRetrieved = false;
    }
    
    getErrors() {
      this.errorsRetrieved = true;
      return this.errors;
    }
    cleanup() {
      if (!this.errorsRetrieved && this.errors.length>0) {
        //eslint-disable-next-line no-console
        console.error("Unexpected GraphQL errors in test:");
        //eslint-disable-next-line no-console
        console.error(this.errors);
        this.errors = [];
        this.errorsRetrieved = false;
        throw new Error(this.errors);
      }
      this.errors = [];
      this.errorsRetrieved = false;
    }
    addError(error) {
      if (Array.isArray(error)) {
        for (let i=0; i<error.length; i++) {
          this.errors.push(error);
        }
      } else {
        this.errors.push(error);
      }
    }
  }
  
  let errorCatcher = new ErrorCatcher();
  
  (before ? before : beforeEach)(() => {
    setOnGraphQLError((errors) => {
      errorCatcher.addError(errors);
    });
  });
  (after ? after : afterEach)(() => {
    errorCatcher.cleanup();
    setOnGraphQLError(null);
  });
  
  return errorCatcher;
};

// Given an error thrown from GraphQL, assert that it is permissions-flavored
// (as opposed to a type error, syntax error, or random unrecognized thing). If
// given an array of errors, asserts that all of them are permissions flavored.
export const assertIsPermissionsFlavoredError = (error) => {
  if (!isPermissionsFlavoredError(error)) {
    //eslint-disable-next-line no-console
    console.error(JSON.stringify(error));
    throw new Error("Error is not permissions-flavored");
  }
}

const isPermissionsFlavoredError = (error) => {
  if (Array.isArray(error)) {
    if (error.length === 0)
      return false;
    for(let i=0; i<error.length; i++) {
      if (!isPermissionsFlavoredError(error[i]))
        return false;
    }
    return true;
  }
  if (!error) {
    return false;
  }
  
  if ("app.validation_error" in error) {
    return true;
  }
  
  if (!error.message) return false;
  let errorData = null;
  try {
    errorData = JSON.parse(error.message);
  } catch(e) {
    return false;
  }
  if (!errorData) return false;
  if (Array.isArray(errorData)) errorData = errorData[0];
  let id = errorData.id;
  switch (id)
  {
  case 'errors.disallowed_property_detected':
  case 'app.operation_not_allowed':
  case 'app.mutation_not_allowed':
  case 'app.user_cannot_moderate_post':
    return true;
  default:
    return false;
  }
};


export const createDefaultUser = async() => {
  // Creates defaultUser if they don't already exist
  const defaultUser = Users.findOne({username:"defaultUser"})
  if (!defaultUser) {
    return createDummyUser({username:"defaultUser"})
  } else {
    return defaultUser
  }
}

export const createDummyPost = async (user, data) => {
  const defaultUser = await createDefaultUser();
  const defaultData = {
    userId: (user && user._id) ? user._id : defaultUser._id,
    title: Random.id(),
  }
  const postData = {...defaultData, ...data};
  const newPostResponse = await newMutation({
    collection: Posts,
    document: postData,
    currentUser: user,
    validate: false,
    context: {},
  });
  return newPostResponse.data
}

export const createDummyUser = async (data) => {
  const testUsername = Random.id()
  const defaultData = {
    username: testUsername,
    email: testUsername + "@test.lesserwrong.com"
  }
  const userData = {...defaultData, ...data};
  const newUserResponse = await newMutation({
    collection: Users,
    document: userData,
    validate: false,
    context: {},
  })
  return newUserResponse.data;
}
export const createDummyComment = async (user, data) => {
  let defaultData = {
    userId: user._id,
    body: "This is a test comment",
  }
  if (!data.postId) {
    defaultData.postId = Posts.findOne()._id; // By default, just grab ID from a random post
  }
  const commentData = {...defaultData, ...data};
  const newCommentResponse = await newMutation({
    collection: Comments,
    document: commentData,
    currentUser: user,
    validate: false,
    context: {},
  });
  return newCommentResponse.data
}

export const createDummyConversation = async (user, data) => {
  let defaultData = {
    title: user.displayName,
    participantIds: [user._id],
  }
  const conversationData = {...defaultData, ...data};
  const newConversationResponse = await newMutation({
    collection: Conversations,
    document: conversationData,
    currentUser: user,
    validate: false,
    context: {},
  });
  return newConversationResponse.data
}

export const createDummyMessage = async (user, data) => {
  let defaultData = {
    content: convertToRaw(ContentState.createFromText('Dummy Message Content')),
    userId: user._id,
  }
  const messageData = {...defaultData, ...data};
  const newMessageResponse = await newMutation({
    collection: Messages,
    document: messageData,
    currentUser: user,
    validate: false,
    context: {},
  });
  return newMessageResponse.data
}

export const clearDatabase = async () => {
  Users.find().fetch().forEach((i)=>{
    Users.remove(i._id)
  })
  Posts.find().fetch().forEach((i)=>{
    Posts.remove(i._id)
  })
  Comments.find().fetch().forEach((i)=>{
    Posts.remove(i._id)
  })
}

export const userUpdateFieldFails = async ({user, document, fieldName, newValue, collectionType}) => {
  if (newValue === undefined) {
    newValue = Random.id()
  }
  const newValueJson = JSON.stringify(newValue);
  
  const query = `
    mutation {
      update${collectionType}(selector: {_id:"${document._id}"},data:{${fieldName}:${newValueJson}}) {
        data {
          ${fieldName}
        }
      }
    }
  `;
  const response = runQuery(query,{},{currentUser:user})
  await response.should.be.rejected;
}

export const userUpdateFieldSucceeds = async ({user, document, fieldName, collectionType, newValue}) => {

  let comparedValue = newValue

  if (newValue === undefined) {
    comparedValue = Random.id()
    newValue = comparedValue;
  }
  const newValueJson = JSON.stringify(newValue);

  const query = `
      mutation {
        update${collectionType}(selector: {_id:"${document._id}"},data:{${fieldName}:${newValueJson}}) {
          data {
            ${fieldName}
          }
        }
      }
    `;
  const response = runQuery(query,{},{currentUser:user})
  const expectedOutput = { data: { [`update${collectionType}`]: { data: { [fieldName]: comparedValue} }}}
  return response.should.eventually.deep.equal(expectedOutput);

}
