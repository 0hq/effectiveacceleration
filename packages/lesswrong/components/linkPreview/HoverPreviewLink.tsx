import React from 'react';
import { Components, registerComponent, Utils } from '../../lib/vulcan-lib';
import { parseRoute, parsePath } from '../../lib/vulcan-core/appContext';
import { hostIsOnsite, useLocation, getUrlClass } from '../../lib/routeUtil';
import Sentry from '@sentry/core';
import { AnalyticsContext } from "../../lib/analyticsEvents";
import { Meteor } from 'meteor/meteor';

export const parseRouteWithErrors = (onsiteUrl: string, contentSourceDescription?: string) => {
  return parseRoute({
    location: parsePath(onsiteUrl),
    onError: (pathname) => {
      if (Meteor.isClient) {
        if (contentSourceDescription)
          Sentry.captureException(new Error(`Broken link from ${contentSourceDescription} to ${pathname}`));
        else
          Sentry.captureException(new Error(`Broken link from ${location.pathname} to ${pathname}`));
      }
    }
  });
}

const linkIsExcludedFromPreview = (url) => {
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
const HoverPreviewLink = ({ innerHTML, href, contentSourceDescription, id }: {
  innerHTML: string,
  href: string,
  contentSourceDescription?: string,
  id?: string
}) => {
  const URLClass = getUrlClass()
  const location = useLocation();

  // Invalid link with no href? Don't transform it.
  if (!href) {
    return <a href={href} dangerouslySetInnerHTML={{__html: innerHTML}} id={id}/>
  }

  // Within-page relative link?
  if (href.startsWith("#")) {
    return <a href={href} dangerouslySetInnerHTML={{__html: innerHTML}} id={id} />
  }

  try {
    const currentURL = new URLClass(location.url, Utils.getSiteUrl());
    const linkTargetAbsolute = new URLClass(href, currentURL);

    const onsiteUrl = linkTargetAbsolute.pathname + linkTargetAbsolute.search + linkTargetAbsolute.hash;
    if (!linkIsExcludedFromPreview(onsiteUrl) && (hostIsOnsite(linkTargetAbsolute.host) || Meteor.isServer)) {
      const parsedUrl = parseRouteWithErrors(onsiteUrl, contentSourceDescription)
      const destinationUrl = parsedUrl.url;

      if (parsedUrl.currentRoute) {
        const PreviewComponent = parsedUrl.currentRoute.previewComponentName ? Components[parsedUrl.currentRoute.previewComponentName] : null;

        if (PreviewComponent) {
          return <AnalyticsContext pageElementContext="linkPreview" href={destinationUrl} hoverPreviewType={parsedUrl.currentRoute.previewComponentName} onsite>
            <PreviewComponent href={destinationUrl} targetLocation={parsedUrl} innerHTML={innerHTML} id={id}/>
          </AnalyticsContext>
        } else {
          return <Components.DefaultPreview href={href} innerHTML={innerHTML} id={id} />
        }
      }
    } else {
      if (linkTargetAbsolute.host === "hubs.mozilla.com") {
        return <Components.MozillaHubPreview href={href} innerHTML={innerHTML} id={id} />
      }
      return <Components.DefaultPreview href={href} innerHTML={innerHTML} id={id} />
    }
    return <a href={href} dangerouslySetInnerHTML={{__html: innerHTML}} id={id} />
  } catch (err) {
    console.error(err) // eslint-disable-line
    console.error(href, innerHTML) // eslint-disable-line
    return <a href={href} dangerouslySetInnerHTML={{__html: innerHTML}} id={id}/>
  }

}

const HoverPreviewLinkComponent = registerComponent('HoverPreviewLink', HoverPreviewLink);

declare global {
  interface ComponentTypes {
    HoverPreviewLink: typeof HoverPreviewLinkComponent
  }
}

