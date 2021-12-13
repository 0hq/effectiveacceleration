// @ts-check (uses JSDoc types for type checking)

import Command from '@ckeditor/ckeditor5-core/src/command';
import Writer from '@ckeditor/ckeditor5-engine/src/model/writer';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';
import { modelQueryElement } from './utils';
import { ATTRIBUTES, ELEMENTS } from './constants';

export default class InsertFootnoteCommand extends Command {
	/**
	 *
	 * @param {{footnoteIndex?: number}} props
	 */
	execute({ footnoteIndex } = { footnoteIndex: 0 }) {
		this.editor.model.enqueueChange(modelWriter => {
			const doc = this.editor.model.document;
			const rootElement = doc.getRoot();
			if (!rootElement) {
				return;
			}
			const footnoteSection = this._getFootnoteSection(modelWriter, rootElement);
			let index, id;
			if(footnoteIndex === 0) {
				index = `${footnoteSection.maxOffset + 1}`;
				id = Math.random().toString(36).slice(2);
			} else {
				index = `${footnoteIndex}`;
				const matchingFootnote = modelQueryElement(this.editor, footnoteSection, element =>
					element.is('element', ELEMENTS.footnoteItem) &&
					element.getAttribute(ATTRIBUTES.footnoteIndex) === index
				);
				id = matchingFootnote && matchingFootnote.getAttribute(ATTRIBUTES.footnoteId);
			}
			if(!id || !index) {
				return;
			}
			modelWriter.setSelection(doc.selection.getFirstPosition());
			const footnoteReference = modelWriter.createElement(ELEMENTS.footnoteReference, { [ATTRIBUTES.footnoteId]: id, [ATTRIBUTES.footnoteIndex]: index });
			this.editor.model.insertContent(footnoteReference);
			modelWriter.setSelection(footnoteReference, 'after');
			// if referencing an existing footnote
			if (footnoteIndex !== 0) {
				return;
			}

			const footnoteContent = modelWriter.createElement(ELEMENTS.footnoteContent);
			const footnoteItem = modelWriter.createElement(ELEMENTS.footnoteItem, { [ATTRIBUTES.footnoteId]: id, [ATTRIBUTES.footnoteIndex]: index });
			const footnoteBackLink = modelWriter.createElement(ELEMENTS.footnoteBackLink, { [ATTRIBUTES.footnoteId]: id, [ATTRIBUTES.footnoteIndex]: index });
			const p = modelWriter.createElement('paragraph');
			modelWriter.append(p, footnoteContent);
			modelWriter.append(footnoteContent, footnoteItem);
			modelWriter.append(footnoteBackLink, footnoteItem);

			this.editor.model.insertContent(footnoteItem, modelWriter.createPositionAt(footnoteSection, footnoteSection.maxOffset));
		});
	}

	refresh() {
		const model = this.editor.model;
		const lastPosition = model.document.selection.getLastPosition();
		const allowedIn = lastPosition && model.schema.findAllowedParent(lastPosition, ELEMENTS.footnoteSection);
		this.isEnabled = allowedIn !== null;
	}

	/**
	 * @param {Writer} writer
	 * @param {RootElement} rootElement
	 * @returns
	 */
	_getFootnoteSection(writer, rootElement) {
		const footnoteSection = modelQueryElement(this.editor, rootElement, element =>  element.is('element', ELEMENTS.footnoteSection));
		if(footnoteSection) {
			return footnoteSection;
		}
		const newFootnoteSection = writer.createElement(
			ELEMENTS.footnoteSection,
		);
		this.editor.model.insertContent(newFootnoteSection, writer.createPositionAt(rootElement, rootElement.maxOffset));
		return newFootnoteSection;
	}
}
