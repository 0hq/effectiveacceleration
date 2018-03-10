/*

A SimpleSchema-compatible JSON schema

*/

import LocalEvents from '../localevents/collection.js';

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

  organizerIds: {
    type: Array,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    hidden: true,
    optional: true,
    control: "UsersListEditor",
    resolveAs: {
      fieldName: 'organizers',
      type: '[User]',
      resolver: (localGroup, args, context) => {
        return _.map(localGroup.organizerIds,
          (organizerId => {return context.Users.findOne({ _id: organizerId }, { fields: context.Users.getViewableFields(context.currentUser, context.Users) })})
        )
      },
      addOriginalField: true
    }
  },

  'organizerIds.$': {
    type: String,
    optional: true,
  },

  localEvents: {
    type: Array,
    optional: true,
    viewableBy: ['guests'],
    resolveAs: {
      arguments: 'limit: Int = 5',
      type: '[LocalEvent]',
      resolver: (localGroup, { limit }, { currentUser, Users, Comments }) => {
        const localEvents = LocalEvents.find({ groupId: localGroup._id }, { limit }).fetch();

        // restrict documents fields
        const viewableEvents = _.filter(localEvents, localEvents => LocalEvents.checkAccess(currentUser, localEvents));
        const restrictedEvents = Users.restrictViewableFields(currentUser, LocalEvents, viewableEvents);

        return restrictedEvents;
      }
    }
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

  name: {
    type: String,
    searchable: true,
    viewableBy: ['guests'],
    editableBy: ['members'],
    insertableBy: ['members'],
    control: "MuiTextField",
    label: "Local Group Name"
  },

  mission: {
    type: String,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    control: 'MuiTextField',
    label: "Mission & Goals",
    blackbox: true,
    optional: true,
  },

  description: {
    type: Object,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    control: 'EditorFormComponent',
    blackbox: true,
    optional: true,
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
    control: "MuiTextField",
    optional: true,
  },

  facebookGroup: {
    type: String,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    label: "Facebook group",
    control: "MuiTextField",
    optional: true,
  },

  website: {
    type: String,
    viewableBy: ['guests'],
    insertableBy: ['members'],
    editableBy: ['members'],
    control: "MuiTextField",
    optional: true,
  },

  post: {
    type: String,
    viewableBy: ['guests'],
    resolveAs: {
      fieldName: 'post',
      type: "Post",
      resolver: (event, args, context) => {
        const post = context.Posts.findOne({eventId: event._id});
        return context.Users.restrictViewableFields(context.currentUser, context.Posts, post);
      }
    }
  }
};

export default schema;
