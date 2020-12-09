import { addCronJob } from '../cronUtil';
import RSSFeeds from '../../lib/collections/rssfeeds/collection';
import { createMutator, updateMutator, Vulcan } from '../vulcan-lib';
import { Posts } from '../../lib/collections/posts';
import Users from '../../lib/collections/users/collection';
import { asyncForeachSequential } from '../../lib/utils/asyncUtils';

const runRSSImport = async () => {
  const feedparser = require('feedparser-promised');
  const feeds = RSSFeeds.find({status: {$ne: 'inactive'}}).fetch()
  await asyncForeachSequential(feeds, async feed => {
    try {
      // create array of all posts in current rawFeed object
      let previousPosts = feed.rawFeed || [];

      // check the feed for new posts
      const url = feed.url;
      const currentPosts = await feedparser.parse(url);
      
      let newPosts: Array<any> = currentPosts.filter(function (post) {
        return !previousPosts.some(prevPost => {
          return post.guid === prevPost.guid
        })
      })

      // update feed object with new feed data (mutation)
      var set: any = {};
      set.rawFeed = currentPosts;

      await updateMutator({
        collection: RSSFeeds,
        documentId: feed._id,
        set: set,
        validate: false,
      })

      await asyncForeachSequential(newPosts, async newPost => {
        var body;

        if (newPost['content:encoded'] && newPost.displayFullContent) {
          body = newPost['content:encoded'];
        } else if (newPost.description) {
          body = newPost.description;
        } else if (newPost.summary) {
          body = newPost.summary;
        } else {
          body = "";
        }

        var post = {
          title: newPost.title,
          userId: feed.userId,
          canonicalSource: feed.setCanonicalUrl ? newPost.link : undefined,
          contents: {
            originalContents: {
              type: "html",
              data: body
            }
          },
          feedId: feed._id,
          feedLink: newPost.link
        };

        let lwUser = Users.findOne({_id: feed.userId});

        await createMutator({
          collection: Posts,
          document: post,
          currentUser: lwUser,
          validate: false,
        })
      })
    } catch(error) {
      //eslint-disable-next-line no-console
      console.error('RSS error: ', error, feed);
    }
  })
}


addCronJob({
  name: 'addNewRSSPosts',
  interval: 'every 10 minutes',
  job: runRSSImport
});

Vulcan.runRSSImport = runRSSImport
