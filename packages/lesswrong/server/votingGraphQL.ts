import { addGraphQLSchema, addGraphQLResolvers, addGraphQLMutation } from '../lib/vulcan-lib/graphql';
import { performVoteServer, clearVotesServer } from './voteServer';
import { VoteableCollections, collectionIsVoteable } from '../lib/make_voteable';

export function createVoteableUnionType() {
  const voteableSchema = VoteableCollections.length ? `union Voteable = ${VoteableCollections.map(collection => collection.typeName).join(' | ')}` : '';
  addGraphQLSchema(voteableSchema);
  
  for (let collection of VoteableCollections)
    addVoteMutations(collection);
   
  
  return {}
}

const resolverMap = {
  Voteable: {
    __resolveType(obj, context, info){
      return obj.__typename;
    },
  },
};

addGraphQLResolvers(resolverMap);

addGraphQLMutation('vote(documentId: String, voteType: String, collectionName: String, voteId: String) : Voteable');

const voteResolver = {
  Mutation: {
    // vote: Voting mutation. Voting toggles, like the vote button UI: if the
    // given vote type is different from the user's previous vote, change to the
    // new vote type, but if it's the same as the user's previous vote, cancel
    // that vote.
    //
    // The voteId argument is ignored (we don't actually want to give clients
    // control over database IDs), but still exists as an option for legacy
    // compatibility.
    //
    // Returns the document that was voted upon, with its score updated.
    async vote(root: void, args: {documentId: string, voteType: string, collectionName: CollectionNameString, voteId?: string}, context: ResolverContext) {
      const {documentId, voteType, collectionName} = args;
      const { currentUser } = context;
      const collection = context[collectionName] as CollectionBase<DbVoteableType>;
      
      if (!collection) throw new Error("Error casting vote: Invalid collectionName");
      if (!collectionIsVoteable(collectionName)) throw new Error("Error casting vote: Collection is not voteable");
      if (!currentUser) throw new Error("Error casting vote: Not logged in.");

      const document = await performVoteServer({
        documentId, voteType, collection, user: currentUser,
        toggleIfAlreadyVoted: true,
      });
      return document;
    },
    
  },
};

addGraphQLResolvers(voteResolver);

function addVoteMutations(collection: CollectionBase<DbVoteableType>) {
  const typeName = collection.options.typeName;
  const mutationName = `setVote${typeName}`;
  
  addGraphQLMutation(`${mutationName}(documentId: String, voteType: String): ${typeName}`);
  
  addGraphQLResolvers({
    Mutation: {
      [mutationName]: async (root: void, args: {documentId: string, voteType: string|null}, context: ResolverContext) => {
        const {documentId, voteType} = args;
        const {currentUser} = context;
        const document = collection.findOne({_id: documentId});
        
        if (!currentUser) throw new Error("Error casting vote: Not logged in.");
        if (!document) throw new Error("No such document ID");
  
        if (voteType === null) {
          return await clearVotesServer({document, user: currentUser, collection});
        } else {
          return await performVoteServer({
            toggleIfAlreadyVoted: false,
            document, voteType, collection, user: currentUser
          });
        }
      }
    }
  });
}
