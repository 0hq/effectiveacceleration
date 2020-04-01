import React from 'react'
import CKEditor from '../editor/ReactCKEditor';
import { CommentEditor } from '@lesswrong/lesswrong-editor';
import { generateTokenRequest } from '../../lib/ckEditorUtils'
import { getSetting } from '../../lib/vulcan-lib';

// Uncomment the import and the line below to activate the debugger
// import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
const uploadUrl = getSetting('ckEditor.uploadUrl', null)

const CKCommentEditor = ({ data, onSave, onChange, onInit }) => {
  const ckEditorCloudConfigured = !!getSetting("ckEditor.webSocketUrl");
  
  return <div>
      <CKEditor
        editor={ CommentEditor }
        onInit={ editor => {
            // Uncomment the line below and the import above to activate the debugger
            // CKEditorInspector.attach(editor)
            if (onInit) onInit(editor)
            return editor
        } }
        onChange={onChange}
        config={{
          cloudServices: ckEditorCloudConfigured ? {
            tokenUrl: generateTokenRequest(),
            uploadUrl,
          } : undefined,
          autosave: {
            save (editor) {
              return onSave && onSave( editor.getData() )
            }
          },
          initialData: data || ""
        }}
      />
    </div>
}
export default CKCommentEditor
