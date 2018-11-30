import { Utils } from 'meteor/vulcan:core';
import { convertFromRaw } from 'draft-js';
import { draftToHTML } from '../../lib/editor/utils.js';
import { highlightFromHTML, postExcerptFromHTML } from '../../lib/editor/ellipsize.jsx';

import TurndownService from 'turndown';
const turndownService = new TurndownService()
turndownService.remove('style') // Make sure we don't add the content of style tags to the markdown

import markdownIt from 'markdown-it'
import markdownItMathjax from './markdown-mathjax.js'
import markdownItContainer from 'markdown-it-container'
var mdi = markdownIt()
mdi.use(markdownItMathjax())
mdi.use(markdownItContainer, 'spoiler')
import { addCallback } from 'meteor/vulcan:core';
import { mjpage }  from 'mathjax-node-page'

import htmlToText from 'html-to-text'

const camel = Utils.camelCaseify

function mjPagePromise(html, beforeSerializationCallback) {
  // Takes in HTML and replaces LaTeX with CommonHTML snippets
  // https://github.com/pkra/mathjax-node-page
  return new Promise((resolve, reject) => {
    mjpage(html, {}, {html: true, css: true}, resolve)
      .on('beforeSerialization', beforeSerializationCallback);
  })
}

export const getExcerptFieldsFromMarkdown = (markdownBody, fieldName = "") => {
  const htmlBody = mdi.render(markdownBody);
  return getExcerptFieldsFromHTML(htmlBody, fieldName);
}

export const getExcerptFieldsFromHTML = (html, fieldName = "") => {
  const markdownBody = htmlToMarkdown(html);
  const wordCount = wordcountFromMarkdown(markdownBody);
  const htmlHighlight = highlightFromHTML(html);
  const excerpt = postExcerptFromHTML(html, 500);
  const plaintextExcerpt = htmlToText.fromString(excerpt);
  return {
    [camel(`${fieldName}WordCount`)]: wordCount,
    [camel(`${fieldName}HtmlHighlight`)]: htmlHighlight,
    [camel(`${fieldName}Excerpt`)]: excerpt,
    [camel(`${fieldName}PlaintextExcerpt`)]: plaintextExcerpt,
  }
}

const wordcountFromMarkdown = (markdownBody) => {
  return markdownBody.split(" ").length;
}

const convertFromContent = (content, fieldName = "") => {
  const contentState = convertFromRaw(content);
  const htmlBody = draftToHTML(contentState)
  const body = htmlToMarkdown(htmlBody)
  return {
    [camel(`${fieldName}HtmlBody`)]: htmlBody,
    [camel(`${fieldName}Body`)]: body,
    ...getExcerptFieldsFromHTML(htmlBody, fieldName),
    [camel(`${fieldName}LastEditedAs`)]: 'draft-js'
  }
}

const convertFromContentAsync = async function(content, fieldName = "") {
  const newContent = await Utils.preProcessLatex(content)
  return convertFromContent(newContent, fieldName)
}

export const htmlToMarkdown = (html) => {
  return turndownService.turndown(html)
}

const convertFromHTML = (html, sanitize, fieldName = "") => {
  const body = htmlToMarkdown(html)
  const htmlBody = sanitize ? Utils.sanitize(html) : html
  return {
    [camel(`${fieldName}HtmlBody`)]: htmlBody,
    [camel(`${fieldName}Body`)]: body,
    ...getExcerptFieldsFromHTML(html, fieldName),
    [camel(`${fieldName}LastEditedAs`)]: "html",
  }
}

const convertFromMarkdown = (body, fieldName = "") => {
  return {
    [camel(`${fieldName}HtmlBody`)]: mdi.render(body),
    [camel(`${fieldName}Body`)]: body,
    ...getExcerptFieldsFromMarkdown(body, fieldName),
    [camel(`${fieldName}LastEditedAs`)]: "markdown"
  }
}

const convertFromMarkdownAsync = async (body, fieldName = "") => {
  const newPostFields = convertFromMarkdown(body, fieldName)
  const newHtmlBody = await mjPagePromise(newPostFields.htmlBody, Utils.trimEmptyLatexParagraphs)
  return {
    ...newPostFields,
    [camel(`${fieldName}HtmlBody`)]: newHtmlBody
  }
}

export function addEditableCallbacks({collection, options = {}}) {
  const {
    fieldName = "",
    deactivateNewCallback // Because of Meteor shenannigans we don't have access to the full user object when a new user is created, and this creates
    // bugs when we register callbacks that trigger on new user creation. So we allow the deactivation of the new callbacks.
  } = options
  const contentFieldName = camel(`${fieldName}Content`)
  const bodyFieldName = camel(`${fieldName}Body`)
  const htmlFieldName = camel(`${fieldName}HtmlBody`)

  async function editorSerializationNew(doc, author) {
    let newFields = {}
    let newDoc = {...doc}
    if (doc[contentFieldName]) {
      newFields = await convertFromContentAsync(doc[contentFieldName], fieldName);
      newDoc = {...doc, ...newFields}
    } else if (doc[bodyFieldName]) {
      newFields = await convertFromMarkdownAsync(doc[bodyFieldName], fieldName)
      newDoc = {...doc, ...newFields}
    } else if (doc[htmlFieldName]) {
      newFields = convertFromHTML(doc[htmlFieldName], !(author && author.isAdmin), fieldName);
      newDoc = {...doc, ...newFields}
    }
    return newDoc
  }
  if (!deactivateNewCallback) {
    addCallback(`${collection.options.collectionName.toLowerCase()}.new.sync`, editorSerializationNew);
  }

  async function editorSerializationEdit (modifier, doc, author) {
    let newFields = {}
    let newModifier = {...modifier}
    if (modifier.$set && modifier.$set[contentFieldName]) {
      newFields = await convertFromContentAsync(modifier.$set[contentFieldName], fieldName)
      newModifier.$set = {...modifier.$set, ...newFields}
      if (modifier.$unset) {delete modifier.$unset[htmlFieldName]}
    } else if (modifier.$set && modifier.$set[bodyFieldName]) {
      newFields = await convertFromMarkdownAsync(modifier.$set[bodyFieldName], fieldName)
      newModifier.$set = {...modifier.$set, ...newFields}
      if (modifier.$unset) {delete modifier.$unset[htmlFieldName]}
    } else if (modifier.$set && modifier.$set[htmlFieldName]) {
      newFields = convertFromHTML(modifier.$set[htmlFieldName], !(author && author.isAdmin), fieldName);
      newModifier.$set = {...modifier.$set, ...newFields}
    }
    return newModifier
  }

  addCallback(`${collection.options.collectionName.toLowerCase()}.edit.sync`, editorSerializationEdit);
}
