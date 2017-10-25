import { addCallback, editMutation } from 'meteor/vulcan:core';
import RSSFeeds from '../collections/rssfeeds/collection.js';

async function populateRawFeed(feed) {
  const feedparser = require('feedparser-promised');
  const url = feed.url;
  const currentPosts = await feedparser.parse(url);
  feed.rawFeed = currentPosts;
  console.log("Imported new RSS feeds, set past posts to: ", feed.rawFeed);
  return feed;
}

addCallback("rssfeeds.new.sync", populateRawFeed);
