import React from 'react';
import { convertFromHTML, convertToHTML } from 'draft-convert';
import { Utils } from 'meteor/vulcan:core';


export const htmlToDraft = convertFromHTML({
  htmlToEntity: (nodeName, node, createEntity) => {
    // console.log("htmlToEntity: ", nodeName, node);
    if (nodeName === 'img') {
      return createEntity(
        'IMAGE',
        'IMMUTABLE',
        {src: node.src}
      )
    }
    if (nodeName === 'a') {
      return createEntity(
        'LINK',
        'MUTABLE',
        {url: node.href}
      )
    }
    // if (nodeName === 'img') {
    //   console.log("image detected: ", node, node.src)
    //   return createEntity(
    //     'IMAGE',
    //     'IMMUTABLE',
    //     {src: node.src}
    //   )
    // }
  },
  htmlToBlock: (nodeName, node, lastList, inBlock) => {
    if (nodeName === 'figure' && node.firstChild.nodeName === 'IMG' || (nodeName === 'img' && inBlock !== 'atomic')) {
        return 'atomic';
    }
    // if (nodeName === 'blockquote') {
    //   return {
    //     type: 'blockquote',
    //     data: {}
    //   };
    // }
    if (nodeName === 'hr') { // This currently appears to be broken, sadly. TODO: Fix this
      return {
        type: 'divider',
        data: {},
        text: 'as',
        depth: 0,
        inlineStyleRanges: [ { offset: 0, length: 2, style: 'ITALIC' } ],
      }
    }
  }
})

export const draftToHTML = convertToHTML({
  //eslint-disable-next-line react/display-name
  styleToHTML: (style) => {
    if (style === 'STRIKETHROUGH') {
      return <span style={{textDecoration: 'line-through'}} />;
    }
  },
  entityToHTML: (entity, originalText) => {
    if (entity.type === 'image' || entity.type === 'IMAGE') {
      let classNames = 'draft-image '
      if (entity.data.alignment) {
        classNames = classNames + entity.data.alignment;
      }
      let style = ""
      if (entity.data.width) {
        style = "width:" + entity.data.width + "%";
      }
      return `<figure><img src="${entity.data.src}" class="${classNames}" style="${style}" /></figure>`;
    }
    if (entity.type === 'LINK') {
      return {
        start: `<a href="${entity.data.url || entity.data.href}">`,
        end: '</a>',
      };
    }
    if (entity.type === 'IMG') {
      const className = 'draft-inline-image';
      return `<img src="${entity.data.src}" class="${className}" alt="${entity.data.alt}"/>`
    }
    if (entity.type === 'INLINETEX') {
      if (entity.data.html) {
        return `<span>${entity.data.css ? `<style>${entity.data.css}</style>` : ""}${entity.data.html}</span>`
      } else {
        return `<span class="draft-latex-placeholder"> &lt; refresh to render LaTeX &gt; </span>`
      }
    }
    return originalText;
  },
  //eslint-disable-next-line react/display-name
  blockToHTML: (block) => {
     const type = block.type;

     if (type === 'atomic') {
       if (block.data && block.data.mathjax && block.data.html) {
         return `<div>${block.data.css ? `<style>${block.data.css}</style>` : ""}${block.data.html}</div>`
       } else if (block.data && block.data.mathjax) {
         return `<div class="draft-latex-placeholder-block"> &lt;refresh to render LaTeX&gt; </div>`
       } else {
         return {start: '<span>', end: '</span>'};
       }
     }
     if (type === 'blockquote') {
       return <blockquote />
     }
    if (type === 'code-block') {
      return {start: '<pre><code>', end: '</code></pre>'};
    }
     if (type === 'divider') {
       return <hr className="dividerBlock" />
     }
    //  return <span/>;
   },
});

Utils.draftToHTML = draftToHTML;
Utils.htmlToDraft = htmlToDraft;
