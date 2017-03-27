/* 

A component to configure the "edit pic" form.
Wrapped with the "withDocument" container.

*/

import React, { PropTypes, Component } from 'react';
import { Components, registerComponent, getFragment } from "meteor/vulcan:core";

import Pics from '../../modules/pics/collection.js';

const PicsEditForm = ({documentId, closeModal}) =>

  <Components.SmartForm 
    collection={Pics}
    documentId={documentId}
    mutationFragment={getFragment('PicsItemFragment')}
    showRemove={true}
    successCallback={document => {
      closeModal();
    }}
  />

export default PicsEditForm;