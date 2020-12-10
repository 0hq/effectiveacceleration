import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib/components';
import { getSiteUrl } from '../../lib/vulcan-lib/utils';
import { parseRoute, parsePath } from '../../lib/vulcan-core/appContext';
import { hostIsOnsite, useLocation, getUrlClass } from '../../lib/routeUtil';
import { AnalyticsContext } from "../../lib/analyticsEvents";
import { isServer } from '../../lib/executionEnvironment';
import withErrorBoundary from '../common/withErrorBoundary';

export const parseRouteWithErrors = (onsiteUrl: string, contentSourceDescription?: string) => {
  return parseRoute({
    location: parsePath(onsiteUrl),
    onError: (pathname) => {
      // Don't capture broken links in Sentry (too spammy, but maybe we'll
      // put this back some day).
      //if (isClient) {
      //  if (contentSourceDescription)
      //    Sentry.captureException(new Error(`Broken link from ${contentSourceDescription} to ${pathname}`));
      //  else
      //    Sentry.captureException(new Error(`Broken link from ${location.pathname} to ${pathname}`));
      //}
    }
  });
}

const linkIsExcludedFromPreview = (url: string): boolean => {
  // Don't try to preview links that go directly to images. The usual use case
  // for such links is an image where you click for a larger version.
  return !!(url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif'));


}

// A link, which will have a hover preview auto-selected and attached. Used from
// ContentItemBody as a replacement for <a> tags in user-provided content.
// Props
//   innerHTML: The contents of the original <a> tag, which get wrapped in a
//     new link and preview.
//   href: The link destination, the href attribute on the original <a> tag.
//   contentSourceDescription: (Optional) A human-readabe string describing
//     where this content came from. Used in error logging only, not displayed
//     to users.
const HoverPreviewLink = ({ innerHTML, href, contentSourceDescription, id, rel }: {
  innerHTML: string,
  href: string,
  contentSourceDescription?: string,
  id?: string,
  rel?: string
}) => {
  const URLClass = getUrlClass()
  const location = useLocation();

  // Invalid link with no href? Don't transform it.
  if (!href) {
    return <a href={href} dangerouslySetInnerHTML={{__html: innerHTML}} id={id} rel={rel}/>
  }

  // Within-page relative link?
  if (href.startsWith("#")) {
    return <a href={href} dangerouslySetInnerHTML={{__html: innerHTML}} id={id} rel={rel} />
  }

  try {
    const currentURL = new URLClass(location.url, getSiteUrl());
    const linkTargetAbsolute = new URLClass(href, currentURL);

    const onsiteUrl = linkTargetAbsolute.pathname + linkTargetAbsolute.search + linkTargetAbsolute.hash;
    if (!linkIsExcludedFromPreview(onsiteUrl) && (hostIsOnsite(linkTargetAbsolute.host) || isServer)) {
      const parsedUrl = parseRouteWithErrors(onsiteUrl, contentSourceDescription)
      const destinationUrl = parsedUrl.url;

      if (parsedUrl.currentRoute) {
        const PreviewComponent: any = parsedUrl.currentRoute.previewComponentName ? Components[parsedUrl.currentRoute.previewComponentName] : null;

        if (PreviewComponent) {
          return <AnalyticsContext pageElementContext="linkPreview" href={destinationUrl} hoverPreviewType={parsedUrl.currentRoute.previewComponentName} onsite>
            <PreviewComponent href={destinationUrl} targetLocation={parsedUrl} innerHTML={innerHTML} id={id}/>
          </AnalyticsContext>
        } else {
          return <Components.DefaultPreview href={href} innerHTML={innerHTML} id={id} rel={rel} />
        }
      }
    } else {
      if (linkTargetAbsolute.host === "hubs.mozilla.com") {
        return <Components.MozillaHubPreview href={href} innerHTML={innerHTML} id={id} />
      }
      if (linkTargetAbsolute.host === "metaculus.com" || linkTargetAbsolute.host === "www.metaculus.com") {
        return <Components.MetaculusPreview href={href} innerHTML={innerHTML} id={id} />
      }
      return <Components.DefaultPreview href={href} innerHTML={innerHTML} id={id} rel={rel} />
    }
    return <a href={href} dangerouslySetInnerHTML={{__html: innerHTML}} id={id} rel={rel} />
  } catch (err) {
    console.error(err) // eslint-disable-line
    console.error(href, innerHTML) // eslint-disable-line
    return <a href={href} dangerouslySetInnerHTML={{__html: innerHTML}} id={id} rel={rel}/>
  }

}

const HoverPreviewLinkComponent = registerComponent('HoverPreviewLink', HoverPreviewLink, { hocs: [withErrorBoundary] });

declare global {
  interface ComponentTypes {
    HoverPreviewLink: typeof HoverPreviewLinkComponent
  }
}

