import Posts from "meteor/nova:posts";
import Comments from "meteor/nova:comments";
import { Utils, getSetting } from 'meteor/nova:core';

const RSS = Npm.require('rss');

Posts.views.rss = Posts.views.new; // default to "new" view for RSS feed

const getMeta = function (url) {
  var siteUrl = getSetting('siteUrl', Meteor.absoluteUrl());
  return {
    title: getSetting('title'),
    description: getSetting('tagline'),
    feed_url: siteUrl+url,
    site_url: siteUrl,
    image_url: siteUrl+'img/favicon.png'
  };
};

const servePostRSS = function (terms, url) {
  var feed = new RSS(getMeta(url));

  var parameters = Posts.getParameters(terms);
  delete parameters['options']['sort']['sticky'];

  const postsCursor = Posts.find(parameters.selector, parameters.options);

  postsCursor.forEach(function(post) {

    var description = !!post.body ? post.body+'</br></br>' : '';
    var feedItem = {
      title: post.title,
      description: description + '<a href="' + post.getPageUrl(true) + '">Discuss</a>',
      author: post.author,
      date: post.postedAt,
      guid: post._id,
      url: (getSetting("RSSLinksPointTo", "link") === "link") ? Posts.getLink(post) : Posts.getPageUrl(post, true)
    };

    if (post.thumbnailUrl) {
      var url = Utils.addHttp(post.thumbnailUrl);
      feedItem.custom_elements = [{"imageUrl":url}, {"content": url}];
    }

    feed.item(feedItem);
  });

  return feed.xml();
};

const serveCommentRSS = function (terms, url) {
  var feed = new RSS(getMeta(url));

  Comments.find({isDeleted: {$ne: true}}, {sort: {postedAt: -1}, limit: 20}).forEach(function(comment) {
    var post = Posts.findOne(comment.postId);
    feed.item({
     title: 'Comment on ' + post.title,
     description: `${comment.body}</br></br><a href="${comment.getPageUrl(true)}">Discuss</a>`,
     author: comment.author,
     date: comment.postedAt,
     url: comment.getPageUrl(true),
     guid: comment._id
    });
  });

  return feed.xml();
};

export {servePostRSS, serveCommentRSS};
