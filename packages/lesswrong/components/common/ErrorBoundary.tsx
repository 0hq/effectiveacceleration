import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import * as Sentry from '@sentry/core';

interface ErrorBoundaryProps {
  children: React.ReactNode,
}
interface ErrorBoundaryState {
  error: any,
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps,ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: false };
  }

  componentDidCatch(error, info) {
    this.setState({ error: error.toString() });
    Sentry.configureScope(scope => {
      Object.keys(info).forEach(key => {
        scope.setExtra(key, info[key]);
      });
    });
    Sentry.captureException(error);
  }

  render() {
    if (this.state.error) {
      return <Components.ErrorMessage message={this.state.error}/>
    }
    if (this.props.children)
      return this.props.children;
    else
      return null;
  }
}

const ErrorBoundaryComponent = registerComponent("ErrorBoundary", ErrorBoundary);

declare global {
  interface ComponentTypes {
    ErrorBoundary: typeof ErrorBoundaryComponent
  }
}
