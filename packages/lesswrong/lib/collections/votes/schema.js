import Users from 'meteor/vulcan:users';
import { schemaDefaultValue } from '../../collectionUtils';

//
// Votes. From the user's perspective, they have a vote-state for each voteable
// entity (post/comment), which is either neutral (the default), upvote,
// downvote, big-upvote or big-downvote.
//
// When you vote and then change it, three things happen. A new vote is created
// for the new vote state (unless that's neutral). First, the old vote has
// 'cancelled' set to true. Second, an "unvote" is created, also with cancelled
// set to true, but with the timestamp corresponding to the moment you changed
// the vote. The power of an unvote is the opposite of the power of the vote
// that was reversed.
//

const schema = {
  _id: {
    type: String,
    canRead: ['guests'],
  },

  // The id of the document that was voted on
  documentId: {
    type: String,
    canRead: ['guests'],
    // No explicit foreign-key relation because which collection this is depends on collectionName
  },

  // The name of the collection the document belongs to
  collectionName: {
    type: String,
    canRead: ['guests'],
  },

  // The id of the user that voted
  userId: {
    type: String,
    canRead: Users.owns,
    foreignKey: 'Users',
  },
  
  // The ID of the author of the document that was voted on
  authorId: {
    type: String,
    denormalized: true, // Can be inferred from documentId
    canRead: ['guests'],
    foreignKey: 'Users',
  },

  // The type of vote, eg smallDownvote, bigUpvote. If this is an unvote, then
  // voteType is the type of the vote that was reversed.
  voteType: {
    type: String,
    canRead: ['guests'],
  },

  // The vote power - that is, the effect this vote had on the comment/post's
  // score. Positive for upvotes, negative for downvotes, based on whether it's
  // a regular or strong vote and on the voter's karma at the time the vote was
  // made. If this is an unvote, then the opposite: negative for undoing an
  // upvote, positive for undoing a downvote.
  power: {
    type: Number,
    optional: true,
    canRead: Users.owns,
    
    // Can be inferred from userId+voteType+votedAt (votedAt necessary because
    // the user's vote power may have changed over time)
    denormalized: true,
  },
  
  // The vote's alignment-forum power - that is, the effect this vote had on
  // the comment/post's AF score.
  afPower: {
    type: Number,
    optional: true,
    viewableBy: ['guests'],
  },
  
  // Whether this vote has been cancelled (by un-voting or switching to a
  // different vote type) or is itself an unvote/cancellation.
  cancelled: {
    type: Boolean,
    canRead: ['guests'],
    ...schemaDefaultValue(false),
  },
  
  // Whether this is an unvote.
  isUnvote: {
    type: Boolean,
    canRead: ['guests'],
    ...schemaDefaultValue(false),
  },

  // Time this vote was cast. If this is an unvote, the time the vote was
  // reversed.
  votedAt: {
    type: Date,
    optional: true,
    canRead: Users.owns,
  }

};

export default schema;
