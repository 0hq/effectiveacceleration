import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import classNames from 'classnames';

const styles = theme => ({
  root: {
    ...theme.typography.errorStyle
  }
})

const FieldErrors = ({ classes, errors }) => (
  <ul className={classNames(classes.root, "form-input-errors")}>
    {errors.map((error, index) => (
      <li key={index}>
        <Components.FormError error={error} errorContext="field" />
      </li>
    ))}
  </ul>
);

const FieldErrorsComponent = registerComponent('FieldErrors', FieldErrors, {styles});

declare global {
  interface ComponentTypes {
    FieldErrors: typeof FieldErrorsComponent
  }
}
