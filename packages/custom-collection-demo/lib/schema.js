import Telescope from 'meteor/nova:lib';
import Users from 'meteor/nova:users';
import mutations from './mutations.js';

const alwaysPublic = user => true;
const isLoggedIn = user => !!user;
const canEdit = mutations.edit.check;

// define schema
const schema = {
  _id: {
    type: String,
    optional: true,
    viewableIf: alwaysPublic,
  },
  name: {
    label: 'Name',
    type: String,
    control: "text",
    viewableIf: alwaysPublic,
    insertableIf: isLoggedIn,
    editableIf: canEdit
  },
  createdAt: {
    type: Date,
    viewableIf: alwaysPublic,
    autoValue: (documentOrModifier) => {
      if (documentOrModifier && !documentOrModifier.$set) return new Date() // if this is an insert, set createdAt to current timestamp  
    }
  },
  year: {
    label: 'Year',
    type: String,
    optional: true,
    control: "text",
    viewableIf: alwaysPublic,
    insertableIf: isLoggedIn,
    editableIf: canEdit
  },
  review: {
    label: 'Review',
    type: String,
    control: "textarea",
    viewableIf: alwaysPublic,
    insertableIf: isLoggedIn,
    editableIf: canEdit
  },
  privateComments: {
    label: 'Private Comments',
    type: String,
    optional: true,
    control: "textarea",
    viewableIf: alwaysPublic, //fixme
    insertableIf: isLoggedIn,
    editableIf: canEdit
  },
  userId: {
    type: String,
    optional: true,
    viewableIf: alwaysPublic,
    insertableIf: isLoggedIn,
    hidden: true,
    resolveAs: 'user: User',
  }
};

export default schema;


const termsSchema = `
  input Terms {
    view: String
    userId: String
    cat: String
    date: String
    after: String
    before: String
    enableCache: Boolean
    listId: String
    query: String # search query
    postId: String
  }
`;

Telescope.graphQL.addSchema(termsSchema);
