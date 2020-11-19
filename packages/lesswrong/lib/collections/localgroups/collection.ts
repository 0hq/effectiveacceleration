import { userCanDo } from '../../vulcan-users/permissions';
import schema from './schema';
import { createCollection } from '../../vulcan-lib';
import './permissions';
import { makeEditable } from '../../editor/make_editable'
import { addUniversalFields, getDefaultResolvers, getDefaultMutations } from '../../collectionUtils'

const options = {
  newCheck: (user: DbUser|null, document: DbLocalgroup|null) => {
    if (!user || !document) return false;
    return document.organizerIds.includes(user._id) ? userCanDo(user, 'localgroups.new.own')
     : userCanDo(user, `localgroups.new.all`)
  },

  editCheck: (user: DbUser|null, document: DbLocalgroup|null) => {
    if (!user || !document) return false;
    return document.organizerIds.includes(user._id) ? userCanDo(user, 'localgroups.edit.own')
    : userCanDo(user, `localgroups.edit.all`)
  },

  removeCheck: (user: DbUser|null, document: DbLocalgroup|null) => {
    if (!user || !document) return false;
    return document.organizerIds.includes(user._id) ? userCanDo(user, 'localgroups.remove.own')
    : userCanDo(user, `localgroups.remove.all`)
  },
}

export const Localgroups: LocalgroupsCollection = createCollection({
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
    hintText: "Short description"
  }

makeEditable({
  collection: Localgroups,
  options: makeEditableOptions
})

addUniversalFields({collection: Localgroups})

export default Localgroups;
