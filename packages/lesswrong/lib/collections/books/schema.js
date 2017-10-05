import React from 'react'
import { Components } from 'meteor/vulcan:core'

const PostEditor = (props) => <div>
  <Components.EditorFormComponent {...props} />
</div>

const PostsListEditor = (props) => <div>
  <Components.PostsListEditor {...props} />
</div>

const SequencesListEditor = (props) => <div>
  <Components.SequencesListEditor {...props} />
</div>

const schema = {

  // default properties

  _id: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
  },

  createdAt: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    onInsert: () => {
      return new Date();
    },
  },

  postedAt: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    onInsert: () => {
      return new Date();
    },
  },
  // Custom Properties

  title: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
  },

  subtitle: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
  },

  description: {
    type: Object,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
    control: 'EditorFormComponent',
    blackbox: true,
  },

  plaintextDescription: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
  },

  collectionId: {
    type: String,
    optional: false,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['members'],
  },

  number: {
    type: Number,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['admins'],
  },

  //TODO: Make resolvers more efficient by running `find` query instead of `findOne` query

  postIds: {
    type: Array,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
    resolveAs: {
      fieldName: 'posts',
      type: '[Post]',
      resolver: (book, args, context) => {
        return (_.map(book.postIds, (id) => {
          return context.Posts.findOne({_id: id}, {fields: context.Users.getViewableFields(context.currentUser, context.Posts)})
        }))
      },
      addOriginalField: true,
    },
    control: 'PostsListEditor',
  },

  'postIds.$': {
    type: String,
    optional: true,
  },

  sequenceIds: {
    type: Array,
    optional: true,
    viewableBy: ["guests"],
    editableBy: ['members'],
    insertableBy: ['members'],
    resolveAs: {
      fieldName: 'sequences',
      type: '[Sequence]',
      resolver: async (book, args, {currentUser, Users, Sequences}) => {
        if (!book.sequenceIds) return [];
        const sequences = _.compact(await Sequences.loader.loadMany(book.sequenceIds));
        return Users.restrictViewableFields(currentUser, Sequences, sequences);
      },
      // resolver: (book, args, context) => {
      //   return (_.map(book.sequenceIds, (id) =>
      //     { return context.Sequences.findOne({ _id: id }, { fields: context.Users.getViewableFields(context.currentUser, context.Sequences)})
      //   }))
      // },
      addOriginalField: true,
    },
    control: 'SequencesListEditor',
  },

  'sequenceIds.$': {
    type: String,
    optional: true,
  }

}


export default schema;
