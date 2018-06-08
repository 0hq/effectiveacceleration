import { addCallback, removeCallback, runCallbacks, runCallbacksAsync } from 'meteor/vulcan:core';
import { Posts } from 'meteor/example-forum';
import Users from 'meteor/vulcan:users';
import { performVoteServer } from 'meteor/vulcan:voting';

import { convertFromRaw } from 'draft-js';
import { draftToHTML } from '../../editor/utils.js';
import { preProcessLatex } from '../../editor/server/utils.js';
import Localgroups from '../localgroups/collection.js';

import marked from 'marked';
import TurndownService from 'turndown';
const turndownService = new TurndownService()


function PostsEditRunPostUndraftedSyncCallbacks (modifier, post) {
  if (modifier.$set && modifier.$set.draft === false && post.draft) {
    modifier = runCallbacks("posts.undraft.sync", modifier, post);
  }
  return modifier;
}
addCallback("posts.edit.sync", PostsEditRunPostUndraftedSyncCallbacks);

function PostsEditRunPostUndraftedAsyncCallbacks (newPost, oldPost) {
  if (!newPost.draft && oldPost.draft) {
    runCallbacksAsync("posts.undraft.async", newPost, oldPost)
  }
  return newPost
}
addCallback("posts.edit.async", PostsEditRunPostUndraftedAsyncCallbacks);

function PostsEditRunPostDraftedAsyncCallbacks (newPost, oldPost) {
  if (newPost.draft && !oldPost.draft) {
    runCallbacksAsync("posts.draft.async", newPost, oldPost)
  }
  return newPost
}
addCallback("posts.edit.async", PostsEditRunPostDraftedAsyncCallbacks);

/**
 * @summary set postedAt when a post is moved out of drafts
 */
function PostsSetPostedAt (modifier, post) {
  modifier.$set.postedAt = new Date();
  if (modifier.$unset) {
    delete modifier.$unset.postedAt;
  }
  return modifier;
}
addCallback("posts.undraft.sync", PostsSetPostedAt);

/**
 * @summary increment postCount when post is undrafted
 */
function postsUndraftIncrementPostCount (post, oldPost) {
  Users.update({_id: post.userId}, {$inc: {postCount: 1}})
}
addCallback("posts.undraft.async", postsUndraftIncrementPostCount);

/**
 * @summary decrement postCount when post is drafted
 */
function postsDraftDecrementPostCount (post, oldPost) {
  Users.update({_id: post.userId}, {$inc: {postCount: -1}})
}
addCallback("posts.draft.async", postsDraftDecrementPostCount);

/**
 * @summary update frontpagePostCount when post is moved into frontpage
 */
function postsEditIncreaseFrontpagePostCount (post, oldPost) {
  if (post.frontpageDate && !oldPost.frontpageDate) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: 1}})
  }
}
addCallback("posts.edit.async", postsEditIncreaseFrontpagePostCount);

/**
 * @summary update frontpagePostCount when post is moved into frontpage
 */
function postsNewIncreaseFrontpageCount (post) {
  if (post.frontpageDate) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: 1}})
  }
}
addCallback("posts.new.async", postsNewIncreaseFrontpageCount);

/**
 * @summary update frontpagePostCount when post is moved into frontpage
 */
function postsRemoveDecreaseFrontpageCount (post) {
  if (post.frontpageDate) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: -1}})
  }
}
addCallback("posts.remove.async", postsRemoveDecreaseFrontpageCount);

/**
 * @summary update frontpagePostCount when post is moved out of frontpage
 */
function postsEditDecreaseFrontpagePostCount (post, oldPost) {
  if (!post.frontpageDate && oldPost.frontpageDate) {
    Users.update({_id: post.userId}, {$inc: {frontpagePostCount: -1}})
  }
}
addCallback("posts.edit.async", postsEditDecreaseFrontpagePostCount);

Posts.convertFromContentAsync = async function(content) {
  const contentState = convertFromRaw(await preProcessLatex(content));
  return {htmlBody: draftToHTML(contentState)}
}

Posts.createHtmlHighlight = (body, id, slug, wordCount) => {
  const highlight = body.replace(/< refresh to render LaTeX >/g, "< LaTeX Equation >")
  if (body.length > 2400) {
    // drop the last paragraph
    const highlight2400Shortened = highlight.slice(0,2400).split("\n").slice(0,-1).join("\n")
    const highlightnewlineShortened = highlight.split("\n\n").slice(0,5).join("\n\n")
    if (highlightnewlineShortened.length > highlight2400Shortened.length) {
      return marked(highlight2400Shortened)
    } else {
      return marked(highlightnewlineShortened)
    }
  } else {
    return marked(highlight)
  }
}

Posts.createExcerpt = (body) => {
  const excerpt = body.slice(0,400)
  if (excerpt.includes("[")) {
    const excerptTrimLink = excerpt.split("[").slice(0, -1).join('[')
    const excerptWithReadMore = excerptTrimLink + `... <span class="post-excerpt-read-more">(Read More)</span>`
    return marked(excerptWithReadMore)
  } else {
    const excerptWithReadMore = excerpt + `... <span class="post-excerpt-read-more">(Read More)</span>`
    return marked(excerptWithReadMore)
  }
}

/*ws
 * @summary Takes in a content field, returns object with {htmlBody, body, excerpt}
*/

Posts.convertFromContent = (content, id, slug) => {
  const contentState = convertFromRaw(content);
  const htmlBody = draftToHTML(contentState)
  const body = turndownService.turndown(htmlBody)
  const excerpt = Posts.createExcerpt(body)
  const wordCount = body.split(" ").length
  const htmlHighlight = Posts.createHtmlHighlight(body, id, slug, wordCount)
  return {
    htmlBody: htmlBody,
    body: body,
    excerpt: excerpt,
    htmlHighlight: htmlHighlight,
    wordCount: wordCount
  }
}

/*
 * @summary Input is html, returns object with {body, excerpt}
*/

Posts.convertFromHTML = (html, id, slug) => {
  const body = turndownService.turndown(html)
  const excerpt = Posts.createExcerpt(body)
  const wordCount = body.split(" ").length
  const htmlHighlight = Posts.createHtmlHighlight(body, id, slug, wordCount)
  return {
    body,
    excerpt,
    wordCount,
    htmlHighlight
  }
}

function PostsNewHTMLSerializeCallback (post) {
  if (post.content) {
    const newPostFields = Posts.convertFromContent(post.content, post._id, post.slug);
    post = {...post, ...newPostFields}
  } else if (post.htmlBody) {
    const newPostFields = Posts.convertFromHTML(post.htmlBody, post._id, post.slug);
    post = {...post, ...newPostFields}
  }
  return post
}

addCallback("posts.new.sync", PostsNewHTMLSerializeCallback);

function PostsEditHTMLSerializeCallback (modifier, post) {
  if (modifier.$set && modifier.$set.content) {
    const newPostFields = Posts.convertFromContent(modifier.$set.content, post._id, post.slug)
    modifier.$set = {...modifier.$set, ...newPostFields}
    delete modifier.$unset.htmlBody;
  } else if (modifier.$set && modifier.$set.htmlBody) {
    const newPostFields = Posts.convertFromHTML(modifier.$set.htmlBody, post._id, post.slug);
    modifier.$set = {...modifier.$set, ...newPostFields}
  }
  return modifier
}

addCallback("posts.edit.sync", PostsEditHTMLSerializeCallback);

async function PostsEditHTMLSerializeCallbackAsync (post) {
  if (post.content) {
    const newPostFields = await Posts.convertFromContentAsync(post.content);
    Posts.update({_id: post._id}, {$set: newPostFields})
  } else if (post.htmlBody) {
    const newPostFields = Posts.convertFromHTML(post.htmlBody, post._id, post.slug);
    Posts.update({_id: post._id}, {$set: newPostFields})
  }
}

addCallback("posts.edit.async", PostsEditHTMLSerializeCallbackAsync);
addCallback("posts.new.async", PostsEditHTMLSerializeCallbackAsync);

function increaseMaxBaseScore ({newDocument, vote}, collection, user, context) {
  if (vote.collectionName === "Posts" && newDocument.baseScore > (newDocument.maxBaseScore || 0)) {
    Posts.update({_id: newDocument._id}, {$set: {maxBaseScore: newDocument.baseScore}})
  }
}

addCallback("votes.smallUpvote.async", increaseMaxBaseScore);
addCallback("votes.bigUpvote.async", increaseMaxBaseScore);

function PostsNewDefaultLocation (post) {
  if (post.isEvent && post.groupId && !post.location) {
    const { location, googleLocation, mongoLocation } = Localgroups.findOne(post.groupId)
    post = {...post, location, googleLocation, mongoLocation}
  }
  return post
}

addCallback("posts.new.sync", PostsNewDefaultLocation);

function PostsNewDefaultTypes (post) {
  if (post.isEvent && post.groupId && !post.types) {
    const { types } = Localgroups.findOne(post.groupId)
    post = {...post, types}
  }
  return post
}

addCallback("posts.new.sync", PostsNewDefaultTypes);

//LESSWRONG: Remove original CommentsNewUpvoteOwnComment from Vulcan
removeCallback('posts.new.after', 'PostsNewUpvoteOwnPost');

// LESSWRONG – bigUpvote
async function LWPostsNewUpvoteOwnPost(post) {
 var postAuthor = Users.findOne(post.userId);
 const votedPost = await performVoteServer({ document: post, voteType: 'bigUpvote', collection: Posts, user: postAuthor })
 return {...post, ...votedPost};
}

addCallback('posts.new.after', LWPostsNewUpvoteOwnPost);
