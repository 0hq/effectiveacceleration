/* eslint-disable no-tabs */
/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

import BalloonBlockEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
// import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import PresenceList from '@ckeditor/ckeditor5-real-time-collaboration/src/presencelist';
import RealTimeCollaborativeComments from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativecomments';
import RealTimeCollaborativeTrackChanges from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativetrackchanges';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import Watchdog from '@ckeditor/ckeditor5-watchdog/src/watchdog';
// Commented out because of competing MathJax bug with Draft-JS
// import Mathematics from './ckeditor5-math/math';

// import MathpreviewPlugin from 'ckeditor5-math-preview/src/mathpreview';
// current version of MathpreviewPlugin (1.1.3) breaks ckeditor

class CommentEditor extends BalloonBlockEditorBase {}
class PostEditor extends BalloonBlockEditorBase {}
class PostEditorCollaboration extends BalloonBlockEditorBase {}

// NOTE: If you make changes to this file, you must:
// 1. navigate in your terminal to the corresponding folder ('cd ./public/lesswrong-editor')
// 2. 'yarn run build'
// 3. navigate back to main folder (i.e. 'cd ../..')
// 4. run 'yarn add ./public/lesswrong-editor'.
//
// alternately, if you're starting in the root directory and want to do it all in one go:
//
// cd ./public/lesswrong-editor; yarn install; yarn run build; cd ../..; yarn add ./public/lesswrong-editor;

const headingOptions = {
	options: [
		{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
		{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
		{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
	]
};

const postEditorPlugins = [
	Autosave,
	Alignment,
	Autoformat,
	BlockToolbar,
	BlockQuote,
	Bold,
	CKFinder,
	Essentials,
	FontFamily,
	FontSize,
	Heading,
	HorizontalLine,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	EasyImage,
	ImageUpload,
	ImageResize,
	Italic,
	Link,
	List,
	Code,
	CodeBlock,
	Subscript,
	Superscript,
	// MediaEmbed,
	Paragraph,
	PasteFromOffice,
	RemoveFormat,
	Strikethrough,
	Table,
	TableToolbar,
	Underline,
	UploadAdapter,
	// Mathematics
];

PostEditor.builtinPlugins = [
	...postEditorPlugins
];

PostEditorCollaboration.builtinPlugins = [
	...postEditorPlugins,
	RealTimeCollaborativeComments,
	RealTimeCollaborativeTrackChanges,
	PresenceList
];

const postEditorConfig = {
	blockToolbar: [
		'imageUpload',
		'insertTable',
		'horizontalLine',
		'mathDisplay'
		// 'mediaEmbed',
	],
	toolbar: [
		'heading',
		'|',
		'bold',
		'italic',
		'strikethrough',
		'|',
		'alignment',
		'|',
		'link',
		'|',
		'blockQuote',
		'bulletedList',
		'numberedList',
		'codeBlock',
		'|',
		'trackChanges',
		'comment',
		'math'
	],
	image: {
		toolbar: [
			'imageTextAlternative',
			'comment',
		],
	},
	heading: headingOptions,
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		],
		tableToolbar: [ 'comment' ]
	},
	math: {
		engine: 'mathjax',
		outputType: 'span',
		forceOutputType: true,
		enablePreview: true
	}
	// mediaEmbed: {
	// 	toolbar: [ 'comment' ]
	// },
};

PostEditor.defaultConfig = {
	...postEditorConfig
};

PostEditorCollaboration.defaultConfig = {
	...postEditorConfig
};

CommentEditor.builtinPlugins = [
	Autosave,
	Alignment,
	Autoformat,
	BlockQuote,
	Bold,
	CKFinder,
	Essentials,
	Heading,
	HorizontalLine,
	EasyImage,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Italic,
	Link,
	List,
	Paragraph,
	CodeBlock,
	PasteFromOffice,
	RemoveFormat,
	Strikethrough,
	Table,
	Underline,
	UploadAdapter,
	// Mathematics
];

CommentEditor.defaultConfig = {
	toolbar: [
		'heading',
		'|',
		'bold',
		'italic',
		'strikethrough',
		'|',
		'link',
		'|',
		'blockQuote',
		'bulletedList',
		'numberedList',
		'|',
		'math'
	],
	image: {
		toolbar: [
			'imageTextAlternative'
		]
	},
	math: {
		engine: 'mathjax',
		outputType: 'span',
		forceOutputType: true,
		enablePreview: true
	},
	heading: headingOptions,
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		],
		tableToolbar: [ 'comment' ]
	},
};

export const Editors = { CommentEditor, PostEditor, PostEditorCollaboration, Watchdog };
