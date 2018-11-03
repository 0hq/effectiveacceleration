import Users from 'meteor/vulcan:users';
import schema from './schema.js';
import { createCollection, getDefaultResolvers, getDefaultMutations } from 'meteor/vulcan:core';
import './permissions.js';
import { makeEditable } from '../../editor/make_editable.js'

const options = {
     newCheck: (user, document) => {
       if (!user || !document) return false;
       return document.organizerIds.includes(user._id) ? Users.canDo(user, 'localgroups.new.own')
        : Users.canDo(user, `localgroups.new.all`)
     },

     editCheck: (user, document) => {
       if (!user || !document) return false;
       return document.organizerIds.includes(user._id) ? Users.canDo(user, 'localgroups.edit.own')
       : Users.canDo(user, `localgroups.edit.all`)
     },

     removeCheck: (user, document) => {
       if (!user || !document) return false;
       return document.organizerIds.includes(user._id) ? Users.canDo(user, 'localgroups.remove.own')
       : Users.canDo(user, `localgroups.remove.all`)
     },
 }

export const Localgroups = createCollection({

  collectionName: 'Localgroups',

  typeName: 'Localgroup',

  schema,

  resolvers: getDefaultResolvers('Localgroups'),

  mutations: getDefaultMutations('Localgroups', options)

});

export const makeEditableOptions = {
    // Determines whether to use the comment editor configuration (e.g. Toolbars)
    commentEditor: true,
    // Determines whether to use the comment editor styles (e.g. Fonts)
    commentStyles: true,
    order: 25,
    permissions: {
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members']
    },
  }

makeEditable({
  collection: Localgroups,
  options: makeEditableOptions
})

export default Localgroups;
