import Users from '../users/collection';
import { Bans } from './collection';

const membersActions = [
  'bans.view',
];
Users.groups.members.can(membersActions);

const adminActions = [
  'bans.new',
  'bans.edit.all',
  'bans.remove.all',
  'bans.view.all',
  'bans.remove',
  'bans.edit',
];
Users.groups.admins.can(adminActions);

Bans.checkAccess = (user, document) => {
  if (!user || !document) return false;
  return Users.canDo(user, 'bans.view')
};
