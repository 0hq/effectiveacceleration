/* global Vulcan */
import Users from 'meteor/vulcan:users';
import { Votes } from '../../lib/collections/votes';
import { getCollection } from 'meteor/vulcan:lib';

Vulcan.rerunAFVotes = () => {
  Users.update({}, {$set:{afKarma:0}}, {multi:true})
  const afVotes = Votes.find({
    afPower:{$exists:true},
    cancelled:false,
  }).fetch()
  //eslint-disable-next-line no-console
  console.log(afVotes.length)
  afVotes.forEach((vote, i)=> {
    if (i%20 == 0) {
      //eslint-disable-next-line no-console
      console.log(i)
    }
    const collection = getCollection(vote.collectionName);
    const document = collection.findOne({_id: vote.documentId});
    if (document.af) {
      Users.update({_id:document.userId}, {$inc: {afKarma: vote.afPower}})
    }
  })
}
