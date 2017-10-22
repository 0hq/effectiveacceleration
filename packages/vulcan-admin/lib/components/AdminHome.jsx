import React from 'react';
import { Components, withCurrentUser, AdminColumns } from 'meteor/vulcan:core';
import { Bans, LWEvents } from 'meteor/lesswrong';
import { FormattedMessage } from 'meteor/vulcan:i18n';
import Users from 'meteor/vulcan:users';
import moment from 'moment';

import '../modules/columns.js';

import { addAdminColumn } from 'meteor/vulcan:core';

const UserIPsDisplay = ({column, document}) => {
  console.log("document.IPs: ", document.IPs);
  return <div>
    {document.IPs && document.IPs.map(ip => <div>{ip}</div>)}
  </div>
}

const DateDisplay = ({document, name}) => <div>
  {moment(document[name].date)}
</div>

const EventPropertiesDisplay = ({column, document}) => {
  console.log("EventPropertiesDisplay", column, document);
  return <div>
    {document[column.name] && document[column.name].ip},
    {document[column.name] && document[column.name].type}
  </div>
}

const UserDisplay = ({column, document}) => <div>
  <Components.UsersName user={document[column.name]} />
</div>

addAdminColumn([{
  name: 'ips',
  component: UserIPsDisplay,
}])

const eventColumns = [
  'createdAt',
  {
    name: 'properties',
    component: EventPropertiesDisplay,
  },
  'userId',
  {
    name: 'user',
    component: UserDisplay,
  }
]

const banColumns = [
  '_id',
  'createdAt',
  'ip',
  'reason',
  'comment',
  'expirationDate'
]
// columns={['_id', 'createdAt', 'expirationDate', 'type', 'user.username', 'ip']}

const AdminHome = ({ currentUser }) =>
  <div className="admin-home page">
    <Components.ShowIf check={Users.isAdmin} document={currentUser} failureComponent={<p className="admin-home-message"><FormattedMessage id="app.noPermission" /></p>}>
      <div>
        <h2>New IP Ban</h2>
        <Components.SmartForm
          collection={Bans}
        />
        <h2>Current IP Bans</h2>
        <Components.Datatable
          collection={Bans}
          columns={banColumns}
          options={{
            fragmentName: 'BansAdminPageFragment',
            terms: {},
            limit: 10,
          }}
          showEdit={true}
        />
        <h2>Recent Logins</h2>
        <Components.Datatable
          collection={LWEvents}
          columns={eventColumns}
          options={{
            fragmentName: 'lwEventsAdminPageFragment',
            terms: {view: "adminView", name: 'login'},
            limit: 10,
          }}
        />
        <h2>All Users</h2>
        <Components.Datatable
          collection={Users}
          columns={AdminColumns}
          options={{
            fragmentName: 'UsersAdmin',
            terms: {view: 'usersAdmin'},
            limit: 20
          }}
          showEdit={true}
        />
      </div>
    </Components.ShowIf>
  </div>

export default withCurrentUser(AdminHome);
