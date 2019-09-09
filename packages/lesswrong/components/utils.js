import { registerComponent, Components, getSetting } from 'meteor/vulcan:core';
import { withStyles } from '@material-ui/core/styles';
import compose from 'lodash/flowRight';

export function defineComponent({name, component, split, styles, hocs})
{
  component.displayName = name;

  if (styles) {
    hocs = _.clone(hocs);
    hocs.push(withStyles(styles, {name: name}));
  }

  if (split) {
    const hocsExecuted = hocs.map(hoc => {
      if(!Array.isArray(hoc)) return hoc;
      const [actualHoc, ...args] = hoc;
      return actualHoc(...args);
    });
    const componentWithHocs = compose(...hocsExecuted)(component);
    return componentWithHocs;
  } else {
    registerComponent(name, component, ...hocs);
  }
}

// Load event component only after checking for hasEvents
//
// hasEvents being false leads to the components not existing. Some components
// will try to destructure the components anyway and then only use them
// conditionally. Allow them to do that without causing an error.
export const loadEventComponent = (componentName) => {
  if (getSetting('hasEvents', true)) {
    return Components[componentName]
  }
  return null
}
