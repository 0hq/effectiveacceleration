import React, { Component } from 'react';
import { Components } from 'meteor/vulcan:core';

/// Higher-order component which adds an error boundary around a component.
/// Unlike putting an <ErrorBoundary/> tag inside your render method, an error
/// boundary defined this way covers the component's constructor, the prelude
/// portions of rendering, and other miscellaneous stuff.
///
/// In order to catch errors that occur in other higher-order components on
/// the same component, put this _first_.
const withErrorBoundary = (WrappedComponent) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <Components.ErrorBoundary>
        <WrappedComponent {...props} />
      </Components.ErrorBoundary>
    );
  }
}

export default withErrorBoundary
