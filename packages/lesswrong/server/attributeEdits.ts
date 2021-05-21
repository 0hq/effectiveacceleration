import { diff } from './vendor/node-htmldiff/htmldiff';
import { Revisions } from '../lib/collections/revisions/collection';
import { compareVersionNumbers } from '../lib/editor/utils';
import cheerio from 'cheerio';
import orderBy from 'lodash/orderBy';
import times from 'lodash/times';
import filter from 'lodash/filter';

type EditAttributions = (string|null)[]
type InsDelUnc = "ins"|"del"|"unchanged"

export async function annotateAuthors(documentId: string, collectionName: string, fieldName: string, upToVersion?: string|null): Promise<string> {
  const revs = await Revisions.find({
    documentId, collectionName, fieldName
  }).fetch();
  if (!revs.length) return "";
  
  const filteredRevs = upToVersion
    ? filter(revs, r=>compareVersionNumbers(upToVersion, r.version)>=0)
    : revs;
  if (!filteredRevs.length) return "";
  
  const revsByDate = orderBy(filteredRevs, r=>r.editedAt);
  const firstRev = revsByDate[0];
  const finalRev = revsByDate[revsByDate.length-1];
  let attributions: EditAttributions = times(firstRev.html?.length||0, ()=>firstRev.userId);
  
  for (let i=1; i<revsByDate.length; i++) {
    const rev = revsByDate[i];
    const prevHtml = revsByDate[i-1].html;
    const newHtml = rev.html;
    attributions = attributeEdits(prevHtml, newHtml, rev.userId, attributions);
  }
  
  return attributionsToSpans(finalRev.html, attributions);
}

function annotateInsDel(root: cheerio.Root): InsDelUnc[] {
  const annotations: InsDelUnc[] = [];
  
  // @ts-ignore
  walkHtmlPreorder<InsDelUnc>(root, "unchanged", (node: cheerio.Element, state: InsDelUnc) => {
    //@ts-ignore
    if (node.type === 'tag' || node.type === "root") {
      if (node.tagName==="ins") {
        return "ins";
      } else if (node.tagName==="del") {
        return "del";
      }
    } else if (node.type === 'text' && node.data) {
      const text: string = node.data;
      for (let i=0; i<text.length; i++)
        annotations.push(state);
    }
    return state;
  });
  
  return annotations;
}

function treeToText($: cheerio.Root): string {
  const textSegments: string[] = [];
  walkHtmlPreorder<null>($.root()[0], null, (node: cheerio.Element, state: null) => {
    if (node.type === 'text' && node.data) {
      const text: string = node.data;
      textSegments.push(text);
    }
    return null;
  });
  return textSegments.join("");
}

function isSpace(s: string): boolean {
  return s.trim()==="";
}

export const attributeEdits = (oldHtml: string, newHtml: string, userId: string, oldAttributions: EditAttributions): EditAttributions => {
  // @ts-ignore
  const parsedOldHtml = cheerio.load(oldHtml, null, false);
  // @ts-ignore
  const parsedNewHtml = cheerio.load(newHtml, null, false);
  const oldText = treeToText(parsedOldHtml);
  const newText = treeToText(parsedNewHtml);
  
  const diffHtml = diff(oldHtml, newHtml);
  // @ts-ignore
  const parsedDiffs = cheerio.load(diffHtml, null, false);
  // @ts-ignore
  const insDelAnnotations = annotateInsDel(parsedDiffs.root()[0]);
  
  let newAttributions: EditAttributions = [];
  let oldTextPos = 0;
  let newTextPos = 0;
  let diffPos = 0;
  let diffText = treeToText(parsedDiffs);
  
  for(; newTextPos<newText.length;) {
    if (insDelAnnotations[diffPos]==='ins' && newText.charCodeAt(newTextPos)===diffText.charCodeAt(diffPos)) {
      newAttributions.push(userId);
      newTextPos++;
      diffPos++;
    } else if (insDelAnnotations[diffPos]==='del' && oldText.charCodeAt(oldTextPos)===diffText.charCodeAt(diffPos)) {
      oldTextPos++;
      diffPos++;
    } else {
      if (oldText.charCodeAt(oldTextPos) === newText.charCodeAt(newTextPos)) {
        newAttributions.push(oldAttributions[oldTextPos]);
        oldTextPos++;
        newTextPos++;
        diffPos++;
      } else {
        let skippedWs = false;
        while (newTextPos<newText.length && isSpace(newText.charAt(newTextPos))) {
          if (newAttributions.length>0)
            newAttributions.push(newAttributions[newAttributions.length-1]);
          else
            newAttributions.push(null);
          newTextPos++;
          skippedWs = true;
        }
        while (oldTextPos<oldText.length && isSpace(oldText.charAt(oldTextPos))) {
          oldTextPos++;
          skippedWs = true;
        }
        while (!skippedWs && diffPos<diffText.length && isSpace(diffText.charAt(diffPos))) {
          diffPos++;
          skippedWs = true;
        }
        
        if (!skippedWs) {
          throw new Error(`Text mismatch: '${oldText.charAt(oldTextPos)}'@${oldTextPos} vs '${newText.charAt(newTextPos)}'@${newTextPos}`);
        }
      }
    }
  }
  
  if (newAttributions.length !== newText.length)
    throw new Error("Result text length mismatch");
  return newAttributions;
}

function walkHtmlPreorder<T>(node: cheerio.Element, props: T, callback: (node: cheerio.Element, props: T)=>T) {
  const childProps: T = callback(node, props);
  //@ts-ignore
  if (node.type==="tag" || node.type==="root") {
    for (let child of node.children) {
      walkHtmlPreorder(child, childProps, callback);
    }
  }
}

function mapHtmlPostorder($: cheerio.Root, node: cheerio.Element, callback: (node: cheerio.Cheerio)=>cheerio.Cheerio): cheerio.Cheerio {
  //@ts-ignore
  if (node.type==="tag" || node.type==="root") {
    const $copiedNode = $(node).clone();
    const mappedChildren = ($copiedNode[0] as cheerio.TagElement).children.map(c =>
      mapHtmlPostorder($, c, callback));
    $copiedNode.empty();
    for (let mappedChild of mappedChildren)
      mappedChild.appendTo($copiedNode);
    return callback($copiedNode);
  } else {
    return callback($(node));
  }
}

function classesToAuthorId(classes: string|null): string|null {
  if (!classes) return null;
  const singleClasses = classes.split(' ');
  for (let singleClass of singleClasses) {
    if (singleClass.startsWith('by_'))
      return singleClass.substr(3);
  }
  return null;
}
function authorIdToClasses(authorId: string|null): string|null {
  if (!authorId) return null;
  return "by_"+authorId;
}

export const spansToAttributions = (html: string): EditAttributions => {
  // @ts-ignore DefinitelyTyped annotation is wrong, and cheerio's own annotations aren't ready yet
  const $ = cheerio.load(html, null, false);
  const ret: EditAttributions = [];
  let currentAuthorId: string|null = null;
  walkHtmlPreorder<void>($.root()[0], undefined, (node: cheerio.Element, props: void) => {
    //@ts-ignore
    if (node.type === 'tag' || node.type === "root") {
      if (node.attribs?.class) {
        const newAuthorId = classesToAuthorId(node.attribs.class)
        if (newAuthorId)
          currentAuthorId = newAuthorId;
      }
    } else if (node.type === 'text' && node.data) {
      for (let i=0; i<node.data.length; i++) {
        ret.push(currentAuthorId);
      }
    }
  });
  return ret;
}

export const applyAttributionsToText = ($: cheerio.Root, node: cheerio.Element, attributions: EditAttributions, startOffset: number): cheerio.Cheerio => {
  if (!node.data || node.data.length===0) {
    return $(node);
  }
  const text = node.data;
  
  function createSpan(className: string|null, text: string): cheerio.Element|string {
    if (className) {
      const span = $('<span/>');
      span.text(text);
      span.attr('class', className);
      return span.toArray()[0];
    } else {
      return text;
    }
  }
  
  let rangeStart = 0;
  let currentAuthor: string|null = attributions[startOffset];
  let spans: (cheerio.Element|string)[] = [];
  for (let i=1; i<text.length; i++) {
    if (attributions[startOffset+i] !== attributions[startOffset+i-1]) {
      const span = createSpan(authorIdToClasses(currentAuthor), text.substr(rangeStart, i-rangeStart));
      spans.push(span);
      currentAuthor = attributions[startOffset+i];
      rangeStart = i;
    }
  }
  spans.push(createSpan(authorIdToClasses(currentAuthor), text.substr(rangeStart)));
  
  if (spans.length===1) {
    return $(spans[0]);
  }
  
  const wrapperSpan = $('<span/>');
  for (let span of spans) {
    // @ts-ignore
    wrapperSpan.append(span);
  }
  return wrapperSpan;
}

export const attributionsToSpans = (html: string, attributions: EditAttributions): string => {
  // @ts-ignore DefinitelyTyped annotation is wrong, and cheerio's own annotations aren't ready yet
  const $ = cheerio.load(html, null, false);
  let attributionPos = 0;
  
  return cheerio.html(mapHtmlPostorder($, $.root()[0], ($node: cheerio.Cheerio) => {
    const node = $node[0];
    if (node.type === 'text' && node.data) {
      const ret = applyAttributionsToText($, node, attributions, attributionPos);
      attributionPos += node.data.length
      return ret;
    } else {
      return $(node);
    }
  }));
}
