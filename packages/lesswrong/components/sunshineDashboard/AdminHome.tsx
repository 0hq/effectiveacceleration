import React, { useState } from 'react';
import { Components, getAdminColumns, registerComponent, addAdminColumn } from '../../lib/vulcan-lib';
import { Bans } from '../../lib/collections/bans';
import { LWEvents } from '../../lib/collections/lwevents';
import { Users } from '../../lib/collections/users/collection';
import { userIsAdmin } from '../../lib/vulcan-users/permissions';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useCurrentUser } from '../common/withUser';
import classNames from 'classnames';

// Also used in ModerationLog
export const styles = (theme: ThemeType): JssStyles => ({
  adminHomeLayout: {
    width: 920,
    margin: "auto",
  },
  adminHomeOrModerationLogPage: {
    fontFamily: theme.typography.fontFamily,
  
    "& h3": {
      fontSize: 20,
      fontWeight: 600,
    },
  
    "& h2": {
      margin: "1%",
    }
  },
  adminLogGroup: {
    border: "solid 1px rgba(0,0,0,.2)",
    padding: 10,
    margin: "1%",
    borderRadius: 2,
  },
  floatLeft: {
    width: "48%",
    float: "left",
  },
  recentLogins: {
    backgroundColor: "rgba(50,100,50,.1)",
  },
  allUsers: {
    backgroundColor: "rgba(100,50,50,.1)",
  },
});

const UserIPsDisplay = ({column, document}) => {
  return <div>
    {document.IPs && document.IPs.map(ip => <div key={ip}>{ip}</div>)}
  </div>
}

const DateDisplay = ({column, document}) => {
  return <div>{document[column.name] && <Components.FormatDate date={document[column.name]}/>}</div>
}

const EventPropertiesDisplay = ({column, document}) => {
  return <div>
    {document[column.name] && document[column.name].ip},
    {document[column.name] && document[column.name].type}
  </div>
}

const UserDisplay = ({column, document}) => {
  return <div>
    <Components.UsersName user={document['user'] || document} />
  </div>
}

addAdminColumn([
  {
    name: 'username',
    component: UserDisplay,
    order:0,
  },
  {
    name: 'email',
    order:1,
  },
  {
    name: 'ips',
    component: UserIPsDisplay,
  },
  {
    name: 'createdAt',
    label: 'Create Date',
    component: DateDisplay,
    order:2,
  },
  {
    name: 'karma',
    order:3,
  },
  {
    name: 'groups',
    order:4,
  },
])

const eventColumns = [
  {
    name: 'createdAt',
    component: DateDisplay,
  },
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
  {
    name: 'createdAt',
    component: DateDisplay,
  },
  'ip',
  'reason',
  'comment',
  {
    name: 'expirationDate',
    component: DateDisplay,
  },
]

const adminViewsOfAllUsers = [
  {
    label: "Created At (Descending)",
    view: "LWUsersAdmin",
    sort: {createdAt:-1},
  },
  {
    label: "Created At (Ascending)",
    view: "LWUsersAdmin",
    sort: {createdAt:1},
  },
  {
    label: "Karm (Descending)",
    view: "LWUsersAdmin",
    sort: {karma:-1},
  },
  {
    label: "Karma (Ascending)",
    view: "LWUsersAdmin",
    sort: {karma:1},
  },
  {
    label: "Sunshines",
    view: "LWSunshinesList",
    sort: {karma:1},
  },
  {
    label: "TrustLevel1",
    view: "LWTrustLevel1List",
    sort: {karma:1},
  },
];

// columns={['_id', 'createdAt', 'expirationDate', 'type', 'user.username', 'ip']}
const AdminHome = ({ classes }: {
  classes: ClassesType
}) => {
  const currentUser = useCurrentUser();
  const [allUsersValue, setAllUsersValue] = useState<any>(0);
  
  if (!userIsAdmin(currentUser)) {
    return (
      <div className={classes.adminHomeOrModerationLogPage}>
        <p className="admin-home-message">Sorry, you do not have permission to do this at this time.</p>
      </div>
    );
  }
  
  return (
    <div className={classes.adminHomeOrModerationLogPage}>
      <div className={classes.adminHomeLayout}>
        <h2>Admin Console</h2>
        <div>
          <div>
            <h3>Server Information</h3>
            <Components.AdminMetadata/>
          </div>
          <div className={classNames(classes.adminLogGroup, classes.recentLogins)}>
            <h3>Recent Logins</h3>
            <Components.Datatable
              collection={LWEvents}
              columns={eventColumns}
              options={{
                fragmentName: 'lwEventsAdminPageFragment',
                terms: {view: 'adminView', name: 'login'},
                limit: 10,
              }}
            />
          </div>
          <div className={classNames(classes.adminLogGroup, classes.allUsers)}>
            <h3>All Users</h3>
            <Select
              value={allUsersValue}
              onChange={(event) => {
                setAllUsersValue(event.target.value);
              }}
            >
              {adminViewsOfAllUsers.map((userView, i) =>
                <MenuItem key={i} value={i}>
                  {userView.label}
                </MenuItem>
              )}
            </Select>
            <Components.Datatable
              collection={Users}
              columns={getAdminColumns()}
              options={{
                fragmentName: 'UsersAdmin',
                terms: {
                  view: adminViewsOfAllUsers[allUsersValue].view,
                  sort: adminViewsOfAllUsers[allUsersValue].sort,
                },
                limit: 20
              }}
              showEdit={true}
              showNew={false}
            />
          </div>
          <div className={classes.adminLogGroup}>
            <h3>New IP Bans</h3>
            <Components.WrappedSmartForm
              collection={Bans}
            />
          </div>
          <div className={classes.adminLogGroup}>
            <h3>Current IP Bans</h3>
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
          </div>
        </div>
      </div>
    </div>
  )
}

const AdminHomeComponent = registerComponent('AdminHome', AdminHome, {styles});

declare global {
  interface ComponentTypes {
    AdminHome: typeof AdminHomeComponent
  }
}

