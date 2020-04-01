import { addGraphQLSchema, Vulcan } from './vulcan-lib';
import { RateLimiter } from './rateLimiter';
import React, { useContext, useEffect, useState, useRef } from 'react'
import { hookToHoc } from './hocUtils'
import { Meteor } from 'meteor/meteor';
import * as _ from 'underscore';

addGraphQLSchema(`
  type AnalyticsEvent {
    type: String!,
    timestamp: Date!,
    props: JSON!
  }
`);

// AnalyticsUtil: An object/namespace full of functions which need to bypass
// the normal import system, because they are client- or server-specific but
// are used by code which isn't.
export const AnalyticsUtil: any = {
  // clientWriteEvents: Send a graphQL mutation from the client to the server
  // with an array of events. Available only on the client and when the react
  // tree is mounted, null otherwise; filled in by Components.AnalyticsClient.
  clientWriteEvents: null,

  // clientContextVars: A dictionary of variables that will be added to every
  // analytics event sent from the client. Client-side only.
  clientContextVars: {},

  // serverWriteEvent: Write a (single) event to the analytics database. Server-
  // side only, filled in in analyticsWriter.js; null on the client. If no
  // analytics database is configured, does nothing.
  serverWriteEvent: null,
};

export function captureEvent(eventType: string, eventProps?: Record<string,any>) {
  try {
    if (Meteor.isServer) {
      // If run from the server, put this directly into the server's write-to-SQL
      // queue.
      AnalyticsUtil.serverWriteEvent({
        type: eventType,
        timestamp: new Date(),
        props: {
          ...eventProps
        },
      });
    } else if (Meteor.isClient) {
      // If run from the client, make a graphQL mutation
      const event = {
        type: eventType,
        timestamp: new Date(),
        props: {
          ...AnalyticsUtil.clientContextVars,
          ...eventProps,
        },
      };
      throttledStoreEvent(event);
      throttledFlushClientEvents();
    }
  } catch(e) {
    // eslint-disable-next-line no-console
    console.error("Error while capturing analytics event: ", e); //eslint-disable-line
  }
}


export const ReactTrackingContext = React.createContext({});

export const AnalyticsContext = ({children, ...props}) => {
  const existingContextData = useContext(ReactTrackingContext)
  const newContextData = {...existingContextData, ...props};
  return <ReactTrackingContext.Provider value={newContextData}>
    {children}
  </ReactTrackingContext.Provider>
}

export function useTracking({eventType="unnamed", eventProps = {}, captureOnMount = false,  skip = false}: {
  eventType?: string,
  eventProps?: any,
  captureOnMount?: any,
  skip?: boolean
}={}) {
  const trackingContext = useContext(ReactTrackingContext)
  useEffect(() => {
    const eventData = {...trackingContext, ...eventProps}
    if (typeof captureOnMount === "function") {
      !skip && captureOnMount(eventData) && captureEvent(`${eventType}Mounted`, eventData)
    } else if (!!captureOnMount) {
      !skip && captureEvent(`${eventType}Mounted`, eventData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip])

  const track: (type?: string|undefined, trackingData?: Record<string,any>)=>void = (type, trackingData) => {
    captureEvent(type || eventType, {
      ...trackingContext,
      ...eventProps,
      ...trackingData
    })
  }
  return {captureEvent: track}
}

export const withTracking = hookToHoc(useTracking)

export function useIsInView({rootMargin='0px', threshold=0}={}) {
  const [entry, setEntry] = useState<any>(null)
  const [node, setNode] = useState<any>(null)

  const observer = useRef<any>(null)

  useEffect(() => {
    if (!window.IntersectionObserver) return

    if (observer.current && node) observer.current.disconnect()

    observer.current = new window.IntersectionObserver(([ entry ]) => {
      setEntry(entry)
    }, {
      rootMargin,
      threshold
    })

    const { current: currentObserver } = observer

    if (node) currentObserver.observe(node)

    return () => currentObserver.disconnect()
  }, [node, rootMargin, threshold])

  return { setNode, entry }
}


// Analytics events have two rate limits, one denominated in events per second,
// the other denominated in uncompressed kilobytes per second. Each of these
// has a burst limit and a steady-state limit. If either rate limit is exceeded,
// a rateLimitExceeded event is sent instead of the original event.
//
// For purposes of calculating rate limits, the size of an event is the JSON
// string length. This undercounts slightly due to Unicode and protocol
// overhead, and overcounts greatly due to compression.
const burstLimitEventCount = 10;
const burstLimitKB = 20;
const rateLimitEventsPerSec = 3.0;
const rateLimitKBps = 5;
const rateLimitEventIntervalMs = 5000;
let eventTypeLimiters = {};

const throttledStoreEvent = (event) => {
  const now = new Date();
  const eventType = event.type;
  const eventSize = JSON.stringify(event).length;

  if (!(eventType in eventTypeLimiters)) {
    eventTypeLimiters[eventType] = {
      eventCount: new RateLimiter({
        burstLimit: burstLimitEventCount,
        steadyStateLimit: rateLimitEventsPerSec,
        timestamp: now
      }),
      eventBandwidth: new RateLimiter({
        burstLimit: burstLimitKB*1024,
        steadyStateLimit: rateLimitKBps*1024,
        timestamp: now
      }),
      exceeded: _.throttle(() => {
        pendingAnalyticsEvents.push({
          type: "rateLimitExceeded",
          timestamp: now,
          props: {
            originalType: eventType
          },
        });
      }, rateLimitEventIntervalMs),
    };
  }
  const limiters = eventTypeLimiters[eventType];
  limiters.eventCount.advanceTime(now);
  limiters.eventBandwidth.advanceTime(now);

  if (limiters.eventCount.canConsumeResource(1)
    && limiters.eventBandwidth.canConsumeResource(eventSize))
  {
    limiters.eventCount.consumeResource(1);
    limiters.eventBandwidth.consumeResource(eventSize);
    pendingAnalyticsEvents.push(event);
  } else {
    limiters.exceeded();
  }
};

Vulcan.captureEvent = captureEvent;

let pendingAnalyticsEvents: Array<any> = [];

function flushClientEvents() {
  if (!AnalyticsUtil.clientWriteEvents)
    return;
  if (!pendingAnalyticsEvents.length)
    return;

  AnalyticsUtil.clientWriteEvents(pendingAnalyticsEvents.map(event => ({
    ...(Meteor.isClient ? AnalyticsUtil.clientContextVars : null),
    ...event
  })));
  pendingAnalyticsEvents = [];
}
const throttledFlushClientEvents = _.throttle(flushClientEvents, 1000);

