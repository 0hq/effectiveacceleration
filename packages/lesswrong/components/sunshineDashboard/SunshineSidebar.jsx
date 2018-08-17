import { Components, registerComponent, withCurrentUser} from 'meteor/vulcan:core';
import React from 'react';
import Users from 'meteor/vulcan:users';

const SunshineSidebar = (props) => {
  if (Users.canDo(props.currentUser, 'posts.moderate.all')) {
    return (
      <div className="sunshine-sidebar">
        <Components.SunshineNewUsersList terms={{view:"sunshineNewUsers"}}/>
        <Components.SunshineNewPostsList terms={{view:"sunshineNewPosts"}}/>
        <Components.SunshineReportedCommentsList terms={{view:"sunshineSidebarReports"}}/>
        <Components.SunshineNewCommentsList terms={{view:"sunshineNewCommentsList"}}/>
        <hr/>
        <Components.SunshineCuratedSuggestionsList terms={{view:"sunshineCuratedSuggestions"}}/>
      </div>
    )
  } else {
    return null
  }
};

SunshineSidebar.displayName = "SunshineSidebar";

registerComponent('SunshineSidebar', SunshineSidebar, withCurrentUser);
