import * as _ from 'underscore';

export type PingbackDocument = {
  collectionName: CollectionNameString,
  documentId: string,
};

export type RouterLocation = {
  currentRoute: Route,
  RouteComponent: any,
  location: any,
  pathname: string,
  url: string,
  hash: string,
  params: Record<string,string>,
  query: Record<string,string>,
  redirected?: boolean,
};

export type Route = {
  // Name of the route. Must be unique, but has no effect, except maybe
  // appearing in debug logging occasionally.
  name: string,
  
  // URL pattern for this route. Syntax comes from the path-to-regexp library
  // (via indirect dependency via react-router).
  path: string,
  
  componentName?: keyof ComponentTypes,
  title?: string,
  titleComponentName?: keyof ComponentTypes,
  subtitle?: string,
  subtitleLink?: string,
  subtitleComponentName?: keyof ComponentTypes,
  redirect?: (location: RouterLocation)=>string,
  getPingback?: (parsedUrl: RouterLocation) => Promise<PingbackDocument|null> | PingbackDocument|null,
  previewComponentName?: keyof ComponentTypes,
  _id?: string|null,
  noIndex?: boolean,
  background?: string,
  sunshineSidebar?: boolean
  disableAutoRefresh?: boolean,
};

// populated by calls to addRoute
export const Routes: Record<string,Route> = {};

// Add a route to the routes table.
//
// Because routes have a bunch of optional fields and fields with constrained
// strings (for component names), merging the types of a bunch of route
// definitions in an array would produce an incorrect type. So instead of taking
// an array argument, take varargs, which preserve the original type.
export const addRoute = (...routes: Route[]): void => {
  for (let route of routes) {
    const {name, path, ...properties} = route;
  
    // check if there is already a route registered to this path
    // @ts-ignore The @types/underscore signature for _.findWhere is narrower than the real function; this works fine
    const routeWithSamePath = _.findWhere(Routes, { path });
  
    if (routeWithSamePath) {
      // Don't allow shadowing/replacing routes
      throw new Error(`Conflicting routes with path ${path}`);
    }
    
    // Check for name collisions
    if (Routes[name]) {
      throw new Error(`Conflicting routes with name ${name}`);
    }
  
    // register the new route
    Routes[name] = {
      name,
      path,
      ...properties
    };
  }
};
