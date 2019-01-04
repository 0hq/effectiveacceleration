import Users from 'meteor/vulcan:users';
import collectionUtils from '../../collectionUtils';

const schema = {

  _id: {
    type: String,
    canRead: ['guests'],
  },

  /**
    The id of the document that was voted on
  */
  documentId: {
    type: String,
    canRead: ['guests'],
  },

  /**
    The name of the collection the document belongs to
  */
  collectionName: {
    type: String,
    canRead: ['guests'],
  },

  /**
    The id of the user that voted
  */
  userId: {
    type: String,
    canRead: Users.owns,
  },
  
  /**
    An optional vote type (for Facebook-style reactions)
  */
  voteType: {
    type: String,
    optional: true,
    canRead: ['guests'],
  },

  /**
    The vote power (e.g. 1 = upvote, -1 = downvote, or any other value)
  */
  power: {
    type: Number,
    optional: true,
    canRead: Users.owns,
    
    // Can be inferred from userId+voteType+votedAt (votedAt necessary because
    // the user's vote power may have changed over time)
    denormalized: true,
  },
  
  /**
    The vote timestamp
  */
  votedAt: {
    type: Date,
    optional: true,
    canRead: Users.owns,
  }

};

export default schema;
