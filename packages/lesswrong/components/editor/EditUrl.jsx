import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Components, registerComponent } from 'meteor/vulcan:core';
import FlatButton from 'material-ui/FlatButton';
import { Input } from 'formsy-react-components';

class EditUrl extends Component {
  constructor(props, context) {
    super(props,context);

    this.state = {
      active: !!this.props.value,
      url: this.props.value,
    };
  }

  toggleEditor = () => {this.setState({active: !this.state.active})}

  render() {
    return (
      <div className="posts-edit-url">
        <div className="row">
          <div className="col-md-4">
            <FlatButton
              backgroundColor={"#bbb"}
              hoverColor={"#ccc"}
              style={{color: "#fff"}}
              label={this.state.active ? "Create Text Post" : "Create Link Post" }
              onTouchTap={this.toggleEditor}/>
          </div>
          <div className="col-md-8">
            <Input
              name={ this.props.name }
              label={ this.props.label }
              placeholder={ this.props.placeholder }
              hidden={ !this.state.active}
              value={this.state.active ? this.state.url : ""}
              type={this.state.active ? "url" : "hidden"}
              layout="elementOnly" />
          </div>
        </div>
      </div>
    )
  }
}

EditUrl.contextTypes = {
  addToAutofilledValues: PropTypes.func,
  addToSuccessForm: PropTypes.func,
  addToSubmitForm: PropTypes.func,
};

registerComponent("EditUrl", EditUrl);
