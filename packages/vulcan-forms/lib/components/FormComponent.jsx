import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Components } from 'meteor/vulcan:core';
import { registerComponent } from 'meteor/vulcan:core';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import SimpleSchema from 'simpl-schema'
import { isEmptyValue, getNullValue } from '../modules/utils.js';

class FormComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillMount() {
    if (this.showCharsRemaining()) {
      const value = this.getValue();
      this.updateCharacterCount(value);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // allow custom controls to determine if they should update
    if (this.isCustomInput(this.getType(nextProps))) {
      return true;
    }

    const { currentValues, deletedValues, errors } = nextProps;
    const { path } = this.props;

    // when checking for deleted values, both current path ('foo') and child path ('foo.0.bar') should trigger updates
    const includesPathOrChildren = deletedValues => deletedValues.some(deletedPath => deletedPath.includes(path));

    const valueChanged = get(currentValues, path) !== get(this.props.currentValues, path);
    const errorChanged = !isEqual(this.getErrors(errors), this.getErrors());
    const deleteChanged = includesPathOrChildren(deletedValues) !== includesPathOrChildren(this.props.deletedValues);
    const charsChanged = nextState.charsRemaining !== this.state.charsRemaining;
    const disabledChanged = nextProps.disabled !== this.props.disabled;

    const shouldUpdate = valueChanged || errorChanged || deleteChanged || charsChanged || disabledChanged;

    return shouldUpdate;
  }

  /*

  If this is an intl input, get _intl field instead

  */
  getPath = props => {
    const p = props || this.props;
    return p.intlInput ? `${p.path}_intl` : p.path;
  };

  /*
  
  Returns true if the passed input type is a custom 
  
  */
  isCustomInput = inputType => {
    const isStandardInput = [
      'nested',
      'number',
      'url',
      'email',
      'textarea',
      'checkbox',
      'checkboxgroup',
      'radiogroup',
      'select',
      'selectmultiple',
      'datetime',
      'date',
      'time',
      'text',
    ].includes(inputType);
    return !isStandardInput;
  };

  /*
  
  Function passed to form controls (always controlled) to update their value
  
  */
  handleChange = (name, value) => {
    // if value is an empty string, delete the field
    if (value === '') {
      value = null;
    }
    // if this is a number field, convert value before sending it up to Form
    if (this.getType() === 'number' && value != null) {
      value = Number(value);
    }

    const updateValue = this.props.locale ? { locale: this.props.locale, value } : value;
    this.props.updateCurrentValues({ [this.getPath()]: updateValue });

    // for text fields, update character count on change
    if (this.showCharsRemaining()) {
      this.updateCharacterCount(value);
    }
  };

  /*
  
  Updates the state of charsCount and charsRemaining as the users types
  
  */
  updateCharacterCount = value => {
    const characterCount = value ? value.length : 0;
    this.setState({
      charsRemaining: this.props.max - characterCount,
      charsCount: characterCount,
    });
  };

  /*

  Get value from Form state through document and currentValues props

  */
  getValue = (props, context) => {
    const p = props || this.props;
    const c = context || this.context;
    const { locale, defaultValue, deletedValues, formType, datatype } = p;
    const path = locale ? `${this.getPath(p)}.value` : this.getPath(p);
    const currentDocument = c.getDocument();
    let value = get(currentDocument, path);
    // note: force intl fields to be treated like strings
    const nullValue = locale ? '' : getNullValue(datatype);

    // handle deleted & empty value
    if (deletedValues.includes(path)) {
      value = nullValue;
    } else if (isEmptyValue(value)) {
      // replace empty value by the default value from the schema if it exists – for new forms only
      value = formType === 'new' && defaultValue ? defaultValue : nullValue;
    }
    return value;
  };

  /*

  Whether to keep track of and show remaining chars

  */
  showCharsRemaining = props => {
    const p = props || this.props;
    return p.max && ['url', 'email', 'textarea', 'text'].includes(this.getType(p));
  };

  /*

  Get errors from Form state through context

  Note: we use `includes` to get all errors from nested components, which have longer paths

  */
  getErrors = errors => {
    errors = errors || this.props.errors;
    const fieldErrors = errors.filter(error => error.path && error.path.includes(this.props.path));
    return fieldErrors;
  };

  /*

  Get form input type, either based on input props, or by guessing based on form field type

  */
  getType = props => {
    const p = props || this.props;
    const fieldType = p.datatype && p.datatype[0].type;
    const autoType =
      fieldType === Number ? 'number' : fieldType === Boolean ? 'checkbox' : fieldType === Date ? 'date' : 'text';
    return p.input || autoType;
  };

  /*
  
  Function passed to form controls to clear their contents (set their value to null)
  
  */
  clearField = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.updateCurrentValues({ [this.props.path]: null });
    if (this.showCharsRemaining()) {
      this.updateCharacterCount(null);
    }
  };

  /*
  
  Function passed to FormComponentInner to help with rendering the component
  
  */
  getFormInput = () => {
    const inputType = this.getType();

    // if input is a React component, use it
    if (typeof this.props.input === 'function') {
      const InputComponent = this.props.input;
      return InputComponent;
    } else {
      // else pick a predefined component

      switch (inputType) {
        case 'text':
          return Components.FormComponentDefault;

        case 'number':
          return Components.FormComponentNumber;

        case 'url':
          return Components.FormComponentUrl;

        case 'email':
          return Components.FormComponentEmail;

        case 'textarea':
          return Components.FormComponentTextarea;

        case 'checkbox':
          return Components.FormComponentCheckbox;

        case 'checkboxgroup':
          return Components.FormComponentCheckboxGroup;

        case 'radiogroup':
          return Components.FormComponentRadioGroup;

        case 'select':
          return Components.FormComponentSelect;

        case 'selectmultiple':
          return Components.FormComponentSelectMultiple;

        case 'datetime':
          return Components.FormComponentDateTime;

        case 'date':
          return Components.FormComponentDate;

        case 'date2':
          return Components.FormComponentDate2;

        case 'time':
          return Components.FormComponentTime;

        case 'statictext':
          return Components.FormComponentStaticText;

        default:
          const CustomComponent = Components[this.props.input];
          return CustomComponent ? CustomComponent : Components.FormComponentDefault;
      }
    }
  };

  getFieldType = () => {
    return this.props.datatype[0].type
  }
  isArrayField = () => {
    return this.getFieldType() === Array
  }
  isObjectField = () => {
    return this.getFieldType() instanceof SimpleSchema
  }
  render() {
    if (this.props.intlInput) {
      return <Components.FormIntl {...this.props} />;
    } else if (this.props.nestedInput) {
      if (this.isArrayField()) {
        return <Components.FormNestedArray {...this.props} errors={this.getErrors()} value={this.getValue()}/>;
      } else if (this.isObjectField()) {
        return <Components.FormNestedObject {...this.props} errors={this.getErrors()} value={this.getValue()}/>;
      }
    }
    return (
      <Components.FormComponentInner
        {...this.props}
        {...this.state}
        inputType={this.getType()}
        value={this.getValue()}
        errors={this.getErrors()}
        document={this.context.getDocument()}
        showCharsRemaining={!!this.showCharsRemaining()}
        onChange={this.handleChange}
        clearField={this.clearField}
        formInput={this.getFormInput()}
      />
    );
  }
}

FormComponent.propTypes = {
  document: PropTypes.object,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.any,
  placeholder: PropTypes.string,
  prefilledValue: PropTypes.any,
  options: PropTypes.any,
  input: PropTypes.any,
  datatype: PropTypes.any,
  path: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  nestedSchema: PropTypes.object,
  currentValues: PropTypes.object.isRequired,
  deletedValues: PropTypes.array.isRequired,
  throwError: PropTypes.func.isRequired,
  updateCurrentValues: PropTypes.func.isRequired,
  errors: PropTypes.array.isRequired,
  addToDeletedValues: PropTypes.func,
  clearFieldErrors: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
};

FormComponent.contextTypes = {
  getDocument: PropTypes.func.isRequired,
};

module.exports = FormComponent

registerComponent('FormComponent', FormComponent);
