import { runCallbacks } from '../vulcan-lib';
import Users from '../collections/users/collection';
import { recalculateScore } from '../scoring';
import * as _ from 'underscore';

// Define voting operations
export const voteTypes = {}

// Add new vote types
export const addVoteType = (voteType, voteTypeOptions) => {
  voteTypes[voteType] = voteTypeOptions;
}

addVoteType('upvote', {power: 1, exclusive: true});
addVoteType('downvote', {power: -1, exclusive: true});

// Test if a user has voted on the client
export const hasVotedClient = ({ document, voteType }) => {
  const userVotes = document.currentUserVotes;
  if (voteType) {
    return _.where(userVotes, { voteType }).length
  } else {
    return userVotes && userVotes.length
  }
}

// Calculate total power of all a user's votes on a document
const calculateTotalPower = votes => _.pluck(votes, 'power').reduce((a, b) => a + b, 0);


// Add a vote of a specific type on the client
const addVoteClient = ({ document, collection, voteType, user, voteId }) => {

  const newDocument = {
    ...document,
    baseScore: document.baseScore || 0,
    __typename: collection.options.typeName,
    currentUserVotes: document.currentUserVotes || [],
  };

  // create new vote and add it to currentUserVotes array
  const vote = createVote({ document, collectionName: collection.options.collectionName, voteType, user, voteId });
  newDocument.currentUserVotes = [...newDocument.currentUserVotes, vote];
  newDocument.voteCount = (newDocument.voteCount||0) + 1;

  // increment baseScore
  newDocument.baseScore += vote.power;
  newDocument.score = recalculateScore(newDocument);

  return newDocument;
}


// Cancel votes of a specific type on a given document (client)
const cancelVoteClient = ({ document, voteType }) => {
  const vote = _.findWhere(document.currentUserVotes, { voteType });
  const newDocument = _.clone(document);
  if (vote) {
    // subtract vote scores
    newDocument.baseScore -= vote.power;
    newDocument.score = recalculateScore(newDocument);

    newDocument.voteCount--;
    
    const newVotes = _.reject(document.currentUserVotes, vote => vote.voteType === voteType);

    // clear out vote of this type
    newDocument.currentUserVotes = newVotes;

  }
  return newDocument;
}

// Clear *all* votes for a given document and user (client)
const clearVotesClient = ({ document }) => {
  const newDocument = _.clone(document);
  newDocument.baseScore -= calculateTotalPower(document.currentUserVotes);
  newDocument.score = recalculateScore(newDocument);
  newDocument.voteCount -= newDocument.currentUserVotes.length
  newDocument.currentUserVotes = [];
  return newDocument
}


// Determine a user's voting power for a given operation.
// If power is a function, call it on user
const getVotePower = ({ user, voteType, document }) => {
  const power = (voteTypes[voteType] && voteTypes[voteType].power) || 1;
  return typeof power === 'function' ? power(user, document) : power;
};

// Create new vote object
export const createVote = ({ document, collectionName, voteType, user, voteId }) => {

  if (!document.userId)
    throw new Error("Voted-on document does not have an author userId?");
  
  const vote = {
    // when creating a vote from the server, voteId can sometimes be undefined
    ...(voteId ? {_id:voteId} : undefined),
    
    documentId: document._id,
    collectionName,
    userId: user._id,
    voteType: voteType,
    power: getVotePower({user, voteType, document}),
    votedAt: new Date(),
    authorId: document.userId,
    cancelled: false,
    __typename: 'Vote'
  }

  return vote;

};

// Optimistic response for votes
export const performVoteClient = ({ document, collection, voteType = 'upvote', user, voteId }) => {

  const collectionName = collection.options.collectionName;
  let returnedDocument;

  // console.log('// voteOptimisticResponse')
  // console.log('collectionName: ', collectionName)
  // console.log('document:', document)
  // console.log('voteType:', voteType)

  // make sure item and user are defined
  if (!document || !user || !Users.canDo(user, `${collectionName.toLowerCase()}.${voteType}`)) {
    throw new Error(`Cannot perform operation '${collectionName.toLowerCase()}.${voteType}'`);
  }

  let voteOptions = {document, collection, voteType, user, voteId};

  if (hasVotedClient({document, voteType})) {

    // console.log('action: cancel')
    returnedDocument = cancelVoteClient(voteOptions);
    returnedDocument = runCallbacks(`votes.cancel.client`, returnedDocument, collection, user, voteType);

  } else {

    // console.log('action: vote')

    if (voteTypes[voteType].exclusive) {
      const tempDocument = runCallbacks(`votes.clear.client`, voteOptions.document, collection, user);
      voteOptions.document = clearVotesClient({document:tempDocument})

    }
    returnedDocument = addVoteClient(voteOptions);
    returnedDocument = runCallbacks(`votes.${voteType}.client`, returnedDocument, collection, user, voteType);
  }

  // console.log('returnedDocument:', returnedDocument)

  return returnedDocument;
}

