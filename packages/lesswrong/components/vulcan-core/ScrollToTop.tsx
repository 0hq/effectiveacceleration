import React, {useEffect, useRef} from 'react';
import {registerComponent} from '../../lib/vulcan-lib';
import { useSubscribedLocation } from '../../lib/routeUtil';

// Scroll restoration based on https://reacttraining.com/react-router/web/guides/scroll-restoration.
export default function ScrollToTop() {
  const { pathname } = useSubscribedLocation();
  const didMountRef = useRef(false)
  useEffect(() => {
    if (didMountRef.current) {
      window.scrollTo(0, 0);
    } else didMountRef.current = true
  }, [pathname])

  return null;
}

const ScrollToTopComponent = registerComponent('ScrollToTop', ScrollToTop);

declare global {
  interface ComponentTypes {
    ScrollToTop: typeof ScrollToTopComponent
  }
}
