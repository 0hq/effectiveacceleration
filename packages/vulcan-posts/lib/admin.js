import { extendFragment, addAdminColumn } from 'meteor/vulcan:core';
import AdminUsersPosts from './components/AdminUsersPosts';

extendFragment('UsersAdmin', `
  posts(limit: 5){
    ...PostsPage
  }
`);

addAdminColumn({
  name: 'posts',
  order: 50,
  component: AdminUsersPosts
});