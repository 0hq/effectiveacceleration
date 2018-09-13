import React, { Component } from 'react';
import { Components, registerComponent } from 'meteor/vulcan:core';
import { withRouter } from 'react-router';


const BenchmarkComponent = (props) => {
  const query = props.router.location.query;
  const count = parseInt(query.count) || 10;
  const groups = parseInt(query.groups) || 1;
  
  let component = (query.useHoC) ? Components.HoCedComponent : TrivialComponent;
  
  return (<div style={{
    width:"100px",
    height:"100px",
    background:"pink"
  }}>
    {_.range(groups).map(i => (
      <div>
        {_.range(count).map(i => <component key={i.toString()} />)}
      </div>
    ))}
  </div>);
}

const TrivialComponent = (props) => {
  return <div/>;
}

const withTrivialHoC = (WrappedComponent) => {
  class WithTrivialHoC extends Component {
    constructor(props) {
      super(props);
    }
    render() {
      return <WrappedComponent />;
    }
  }
};

registerComponent('BenchmarkComponent', BenchmarkComponent, withRouter);
registerComponent('TrivialComponent', TrivialComponent);
registerComponent('HoCedComponent', TrivialComponent,
  withTrivialHoC, withTrivialHoC, withTrivialHoC, withTrivialHoC, withTrivialHoC);