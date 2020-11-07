import { runCallbacks, CallbackHook, CallbackChainHook } from '../vulcan-lib/callbacks';
import { userCanDo } from '../vulcan-users/permissions';
import { recalculateScore } from '../scoring';
import { voteTypes, calculateVotePower } from './voteTypes';
import * as _ from 'underscore';

export interface VoteDocTuple {
  newDocument: DbVoteableType
  vote: DbVote
}
export const voteCallbacks = {
  cancelSync: new CallbackChainHook<VoteDocTuple,[CollectionBase<DbVoteableType>,DbUser]>("votes.cancel.sync"),
  cancelAsync: new CallbackHook<[VoteDocTuple,CollectionBase<DbVoteableType>,DbUser]>("votes.cancel.async"),
  castVoteSync: new CallbackChainHook<VoteDocTuple,[CollectionBase<DbVoteableType>,DbUser]>("votes.castVote.sync"),
  castVoteAsync: new CallbackHook<[VoteDocTuple,CollectionBase<DbVoteableType>,DbUser]>("votes.castVote.async"),
};


// Given a client-side view of a document, return a modified version in which
// the user has voted and the scores are updated appropriately.
const addVoteClient = ({ document, collection, voteType, user }: {
  document: VoteableTypeClient,
  collection: CollectionBase<DbObject>,
  voteType: string,
  user: UsersCurrent,
}) => {
  const power = getVotePower({user, voteType, document});
  const isAfVote = (document.af && userCanDo(user, "votes.alignment"))
  const afPower = isAfVote ? calculateVotePower(user.afKarma, voteType) : 0;

  const newDocument = {
    ...document,
    currentUserVote: voteType,
    baseScore: (document.baseScore||0) + power,
    voteCount: (document.voteCount||0) + 1,
    afBaseScore: (document.afBaseScore||0) + afPower,
    afVoteCount: (document.afVoteCount||0) + (isAfVote?1:0),
    __typename: collection.options.typeName,
  };

  newDocument.score = recalculateScore(newDocument);
  return newDocument;
}


// Given a client-side view of a document, return a modified version in which
// the current user's vote is removed and the score is adjusted accordingly.
const cancelVoteClient = ({document, collection, user}: {
  document: VoteableTypeClient,
  collection: CollectionBase<DbObject>,
  user: UsersCurrent,
}): VoteableTypeClient => {
  if (!document.currentUserVote)
    return document;
  
  // Compute power for the vote being removed. Note that this is not quite
  // right if the user's vote weight has changed; the eager update will remove
  // points based on the user's new vote weight, which will then be corrected
  // when the server responds.
  const voteType = document.currentUserVote;
  const power = getVotePower({user, voteType, document});
  const isAfVote = (document.af && userCanDo(user, "votes.alignment"))
  const afPower = isAfVote ? calculateVotePower(user.afKarma, voteType) : 0;
  
  const newDocument = {
    ...document,
    currentUserVote: null,
    baseScore: (document.baseScore||0) - power,
    afBaseScore: (document.afBaseScore||0) - afPower,
    voteCount: (document.voteCount||0)-1,
    afVoteCount: (document.afVoteCount||0) - (isAfVote?1:0),
  };
  newDocument.score = recalculateScore(newDocument);
  
  return newDocument;
}


// Determine a user's voting power for a given operation.
// If power is a function, call it on user
const getVotePower = ({ user, voteType, document }: {
  user: DbUser|UsersCurrent,
  voteType: string,
  document: VoteableType,
}) => {
  const power = (voteTypes[voteType]?.power) || 1;
  return typeof power === 'function' ? power(user, document) : power;
};

// Create new vote object
export const createVote = ({ document, collectionName, voteType, user, voteId }: {
  document: VoteableType,
  collectionName: CollectionNameString,
  voteType: string,
  user: DbUser|UsersCurrent,
  voteId?: string,
}) => {

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
export const setVoteClient = async ({ document, collection, voteType, user }: {
  document: VoteableTypeClient,
  collection: CollectionBase<DbVoteableType>
  voteType: string|null,
  user: UsersCurrent,
}): Promise<VoteableTypeClient> => {
  if (voteType && !voteTypes[voteType]) throw new Error("Invalid vote type");
  const collectionName = collection.options.collectionName;

  // make sure item and user are defined
  if (!document || !user || (voteType && !userCanDo(user, `${collectionName.toLowerCase()}.${voteType}`))) {
    throw new Error(`Cannot vote on '${collectionName.toLowerCase()}`);
  }

  if (!voteType) {
    return cancelVoteClient({document, collection, user});
  } else {
    document = cancelVoteClient({document, collection, user})
    return addVoteClient({document, collection, voteType, user});
  }
}

