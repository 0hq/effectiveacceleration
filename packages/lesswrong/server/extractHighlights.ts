import cheerio from 'cheerio';

export function htmlStartingAtHash(html: string, hash: string): string {
  try {
    // Find the given anchor, if present
    // @ts-ignore DefinitelyTyped annotation is wrong, and cheerio's own annotations aren't ready yet
    const $ = cheerio.load(html, null, false);
    const matchesWithID = $(`#${hash}`);
    if (matchesWithID.length==0)
      return html;
    const sectionElement = matchesWithID[0];
    
    // Drop everything that precedes the anchor
    // @ts-ignore DefinitelyTyped annotation is wrong, and cheerio's own annotations aren't ready yet
    while (sectionElement.previousSibling) {
      // @ts-ignore DefinitelyTyped annotation is wrong, and cheerio's own annotations aren't ready yet
      $(sectionElement.previousSibling).remove();
    }
    
    return $.html();
  } catch(e) {
    // eslint-disable-next-line no-console
    console.error(`Error extracting HTML highlight: ${e}`);
    return html;
  }
}
