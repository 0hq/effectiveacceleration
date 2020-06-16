import { addFieldsDict, denormalizedCountOfReferences, accessFilterMultiple } from './utils/schemaUtils'
import { getWithLoader } from './loaders'

export const VoteableCollections: Array<any> = [];

// options: {
//   customBaseScoreReadAccess: baseScore can have a customized canRead value.
//     Option will be bassed directly to the canRead key
// }
export const makeVoteable = (collection, options?: any) => {
  options = options || {}
  const {customBaseScoreReadAccess} = options

  VoteableCollections.push(collection);

  addFieldsDict(collection, {
    currentUserVotes: {
      type: Array,
      optional: true,
      viewableBy: ['guests'],
      resolveAs: {
        type: '[Vote]',
        resolver: async (document, args, context: ResolverContext) => {
          const { Votes, currentUser } = context;
          if (!currentUser) return [];
          const votes = await getWithLoader(Votes,
            `votesByUser${currentUser._id}`,
            {
              userId: currentUser._id,
              cancelled: false,
            },
            "documentId", document._id
          );
          
          if (!votes.length) return [];
          return await accessFilterMultiple(currentUser, Votes, votes, context);
        },
      }
    },
    'currentUserVotes.$': {
      type: Object,
      optional: true
    },
    allVotes: {
      type: Array,
      optional: true,
      viewableBy: ['guests'],
      resolveAs: {
        type: '[Vote]',
        resolver: async (document, args, context: ResolverContext) => {
          const { Votes, currentUser } = context;
          const votes = await getWithLoader(Votes,
            "votesByDocument",
            {
              cancelled: false,
            },
            "documentId", document._id
          );
          
          if (!votes.length) return [];
          return await accessFilterMultiple(currentUser, Votes, votes, context);
        },
      }
    },
    'allVotes.$': {
      type: Object,
      optional: true
    },
    voteCount: {
      ...denormalizedCountOfReferences({
        fieldName: "voteCount",
        collectionName: collection.collectionName,
        foreignCollectionName: "Votes",
        foreignTypeName: "vote",
        foreignFieldName: "documentId",
        filterFn: vote => !vote.cancelled
      }),
      viewableBy: ['guests'],
    },
    // The document's base score (not factoring in the document's age)
    baseScore: {
      type: Number,
      optional: true,
      defaultValue: 0,
      canRead: customBaseScoreReadAccess || ['guests'],
      onInsert: document => {
        // default to 0 if empty
        return document.baseScore || 0;
      }
    },
    // The document's current score (factoring in age)
    score: {
      type: Number,
      optional: true,
      defaultValue: 0,
      canRead: ['guests'],
      onInsert: document => {
        // default to 0 if empty
        return document.score || 0;
      }
    },
    // Whether the document is inactive. Inactive documents see their score
    // recalculated less often
    inactive: {
      type: Boolean,
      optional: true,
      onInsert: () => false
    },
  });
}
