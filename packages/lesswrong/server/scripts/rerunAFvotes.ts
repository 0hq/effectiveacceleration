import Users from '../../lib/collections/users/collection';
import { Votes } from '../../lib/collections/votes';
import { Vulcan, getCollection } from '../vulcan-lib';
import { asyncForeachSequential } from '../../lib/utils/asyncUtils';

Vulcan.rerunAFVotes = async () => {
  await Users.update({}, {$set:{afKarma:0}}, {multi:true})
  const afVotes = await Votes.find({
    afPower:{$exists:true},
    cancelled:false,
  }).fetch()
  //eslint-disable-next-line no-console
  console.log(afVotes.length)
  await asyncForeachSequential(afVotes, async (vote, i) => {
    if (i%20 == 0) {
      //eslint-disable-next-line no-console
      console.log(i)
    }
    const collection = getCollection(vote.collectionName as VoteableCollectionName);
    const document = await collection.findOne({_id: vote.documentId}) as VoteableType;
    if (document.af) {
      await Users.update({_id:document.userId}, {$inc: {afKarma: vote.afPower}})
    }
  })
}
