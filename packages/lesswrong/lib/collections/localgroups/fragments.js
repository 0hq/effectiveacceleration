import { registerFragment } from 'meteor/vulcan:core';

registerFragment(`
  fragment localGroupsHomeFragment on LocalGroup {
    _id
    createdAt
    organizerIds
    organizers {
      ...UsersMinimumInfo
    }
    lastActivity
    name
    location
    googleLocation
    mongoLocation
    description
    contactInfo
    facebookGroup
    website
  }
`);
