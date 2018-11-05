import { generateIdResolverMulti } from '../../modules/utils/schemaUtils'

/*

A SimpleSchema-compatible JSON schema

*/
import { localGroupTypeFormOptions } from './groupTypes';

const schema = {
  _id: {
    optional: true,
    type: String,
    viewableBy: ['guests'],
  },
  createdAt: {
    optional: true,
    type: Date,
    viewableBy: ['guests'],
    onInsert: (document) => {
      return new Date();
    }
  },


  name: {
    type: String,
    searchable: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    order:10,
    insertableBy: ['members'],
    control: "MuiInput",
    label: "Local Group Name"
  },

  organizerIds: {
    type: Array,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    order:20,
    control: "UsersListEditor",
    label: "Add Organizers",
    resolveAs: {
      fieldName: 'organizers',
      type: '[User]',
      resolver: generateIdResolverMulti(
        {collectionName: 'Users', fieldName: 'organizerIds'}
      ),
      addOriginalField: true
    }
  },

  'organizerIds.$': {
    type: String,
    optional: true,
  },

  lastActivity: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    onInsert: () => new Date(),
    hidden: true,
  },

  types: {
    type: Array,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    control: 'MultiSelectButtons',
    label: "Group Type:",
    minCount: 1, // Ensure that at least one type is selected
    form: {
      options: localGroupTypeFormOptions
    },
  },

  'types.$': {
    type: String,
    optional: true,
  },

  description: {
    type: Object,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    control: 'EditorFormComponent',
    blackbox: true,
    hidden: true,
    optional: true,
    form: {
      enableMarkDownEditor: false
    }
  },

  mongoLocation: {
    type: Object,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    hidden: true,
    blackbox: true,
  },

  googleLocation: {
    type: Object,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    label: "Group Location",
    control: 'LocationFormComponent',
    blackbox: true,
  },

  location: {
    type: String,
    searchable: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
    hidden: true,
  },

  contactInfo: {
    type: String,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    label: "Contact Info",
    control: "MuiInput",
    optional: true,
  },

  facebookLink: {
    type: String,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    label: "Facebook group",
    control: "MuiInput",
    optional: true,
  },

  website: {
    type: String,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    control: "MuiInput",
    optional: true,
  },
};

export default schema;
