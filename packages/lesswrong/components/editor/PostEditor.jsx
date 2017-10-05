import React, { PropTypes, Component } from 'react';
import { Components, registerComponent, withCurrentUser, Utils } from 'meteor/vulcan:core';
import Editor, { Editable, createEmptyState } from 'ory-editor-core';
import { Trash, DisplayModeToggle, Toolbar } from 'ory-editor-ui'
import withEditor from './withEditor.jsx'
import { IntercomAPI } from 'react-intercom';
import { isEmpty } from '../../lib/modules/utils.js';

const placeholderContent = {
    id: '2',
    cells: [{
      rows: [
        {
          cells: [
            {
              content: {
                plugin: {
                  name: 'ory/editor/core/content/slate'
                },
                state: {}
              },
              id: '7d29c96e-53b8-4b3e-b0f1-758b405d6daf'
            }
          ],
          id: 'd62fe894-5795-4f00-80c8-0a5c9cfe85b9'
        },
      ],
      id: '15efd3c3-b683-4da6-b107-16d8d0c8cd26'
    }]
  };

function htmlToOry(html) {
  return {
      id: '2',
      cells: [{
        rows: [
          {
            cells: [
              {
                content: {
                  plugin: {
                    name: 'ory/editor/core/content/slate'
                  },
                  state: {
                    importFromHtml: Utils.sanitize(html),
                  }
                },
                id: '7d29c96e-53b8-4b3e-b0f1-758b405d6daf'
              }
            ],
            id: 'd62fe894-5795-4f00-80c8-0a5c9cfe85b9'
          },
        ],
        id: '15efd3c3-b683-4da6-b107-16d8d0c8cd26'
      }]
    };
}


class PostEditor extends Component {
  constructor(props) {
    super(props);
    const editor = this.props.editor;
    const fieldName = this.props.name;
    const document = this.props.document;
    console.log("PostEditor document", document);
    let state = document && document[fieldName]

    if (document && document[fieldName] && !_.isEmpty(document[fieldName])) {
      // Perform deep copy on content to avoid Slate bug when passing
      // in frozen or immutable objects
      state = JSON.parse(JSON.stringify(document[fieldName]));
      editor.trigger.editable.add(state)
    // } else if (document && document.htmlBody) {
    //   console.log("Found old html content, importing to Ory...");
    //   console.log("Ory Translation: ", htmlToOry(document.htmlBody));
    //   editor.trigger.editable.add(htmlToOry(document.htmlBody));
    } else {
      editor.trigger.editable.add(createEmptyState());
    }

  }

  componentWillMount() {
    IntercomAPI('hide');
    //Add function for resetting form to form submit callbacks
    const fieldName = this.props.name;
    const checkForEmpty = (data) => {
      console.log("Check for empty called", data);
      if (isEmpty(data[fieldName])) {
        console.log("Submitted empty editor component, resetting state");
        data[fieldName] = null;
      }
      return data;
    }
    this.context.addToSubmitForm(checkForEmpty);
  }

  isEditorEmpty = (state) => {
    const flatState = flatten(state);
    let hasContent = false;
    console.log("FlatState", flatState);
    Object.keys(flatState).forEach((key) => {
      if (flatState[key] && flatState[key].kind == "text" && flatState[key].text && flatState[key].text != "") {
        hasContent = true;
      }
    })
    // const slateState = state && state.cells && state.cells[0] && state.cells[0].content && state.cells[0].content.state
    // console.log("slateState", slateState);
    // const blocks = slateState && slateState.serialized && slateState.serialized.nodes && _.filter(slateState.serialized.nodes, (b) => (b.kind == "block"))
    // console.log("blocks", blocks);
    // const textState = blocks && _.filter(blocks, (b) => _.filter(b.nodes, (b2) => b2.kind == "text" && b2.text != "").length)
    // console.log("textState", textState);
    return hasContent;
  }

  onChange = (state) => {
    const fieldName = this.props.name;
    const addValues = this.context.addToAutofilledValues;
    addValues({[fieldName]: state});
  }

  render() {
    const editor = this.props.editor;
    return (
      <div className="postEditor">
        <Editable editor={editor} id={placeholderContent.id} onChange={this.onChange} />
        <Trash editor={editor} />
        <DisplayModeToggle editor={editor} />
        <Toolbar editor={editor} />
      </div>
    );
  }
}

PostEditor.contextTypes = {
  addToAutofilledValues: React.PropTypes.func,
  addToSuccessForm: React.PropTypes.func,
  addToSubmitForm: React.PropTypes.func,
};

registerComponent('PostEditor', PostEditor, withEditor, withCurrentUser);

export default withEditor(PostEditor);
