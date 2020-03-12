import { Components, registerComponent } from '../../lib/vulcan-lib';
import React, { useState } from 'react';
import Users from '../../lib/collections/users/collection';
import { useCurrentUser } from '../common/withUser';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import classNames from 'classnames';
import withErrorBoundary from '../common/withErrorBoundary';

const styles = theme => ({
  root: {
    position:"absolute",
    top:0,
    right:0,
    width:250,
    marginTop:63,
    zIndex: theme.zIndexes.sunshineSidebar,
    display:"none",
    [theme.breakpoints.up('lg')]: {
      display:"block"
    }
  },
  showSidebar: {
    background: "white",
  },
  toggle: {
    position: "relative",
    zIndex: theme.zIndexes.sunshineSidebar,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 8,
    width: "100%",
    fontSize: "1rem",
    ...theme.typography.commentStyle,
    color: theme.palette.grey[400],
    cursor: "pointer",
  }
})

const SunshineSidebar = ({classes}) => {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showUnderbelly, setShowUnderbelly] = useState(false)
  const currentUser = useCurrentUser();

  const { SunshineNewUsersList, SunshineNewCommentsList, SunshineNewPostsList, SunshineReportedContentList, SunshineCuratedSuggestionsList, AFSuggestUsersList, AFSuggestPostsList, AFSuggestCommentsList } = Components

  return (
    <div className={classNames(classes.root, {[classes.showSidebar]:showSidebar})}>
      {Users.canDo(currentUser, 'posts.moderate.all') && <div>
        <SunshineNewPostsList terms={{view:"sunshineNewPosts"}}/>
        <SunshineNewUsersList terms={{view:"sunshineNewUsers", limit: 30}}/>
        <SunshineReportedContentList terms={{view:"sunshineSidebarReports", limit: 30}}/>
        
        {/* alignmentForumAdmins see AF content above the fold */}
        { currentUser?.groups && currentUser.groups.includes('alignmentForumAdmins') && <div>
          <AFSuggestUsersList terms={{view:"alignmentSuggestedUsers", limit: 100}}/>
          <AFSuggestPostsList terms={{view:"alignmentSuggestedPosts"}}/>
          <AFSuggestCommentsList terms={{view:"alignmentSuggestedComments"}}/>
        </div>}
      </div>}

      { showSidebar ? <div className={classes.toggle} onClick={() => setShowSidebar(false)}>
        Hide Full Sidebar
          <KeyboardArrowDownIcon />
        </div>
        :
        <div className={classes.toggle} onClick={() => setShowSidebar(true)}>
          Show Full Sidebar
          <KeyboardArrowRightIcon />
        </div>}

      { showSidebar && <div>
        {!!currentUser!.viewUnreviewedComments && <SunshineNewCommentsList terms={{view:"sunshineNewCommentsList"}}/>}
        <SunshineCuratedSuggestionsList terms={{view:"sunshineCuratedSuggestions", limit: 50}}/>
        
        {/* regular admins (but not sunshines) see AF content below the fold */}
        { Users.isAdmin(currentUser) && <div>
          <AFSuggestUsersList terms={{view:"alignmentSuggestedUsers", limit: 100}}/>
          <AFSuggestPostsList terms={{view:"alignmentSuggestedPosts"}}/>
          <AFSuggestCommentsList terms={{view:"alignmentSuggestedComments"}}/>
        </div>}
      </div>}

      { showSidebar && <div>
        { showUnderbelly ? <div className={classes.toggle} onClick={() => setShowUnderbelly(false)}>
          Hide the Underbelly
          <KeyboardArrowDownIcon/>
        </div>
        :
        <div className={classes.toggle} onClick={() => setShowUnderbelly(true)}>
          Show the Underbelly
          <KeyboardArrowRightIcon/>
        </div>}
        { showUnderbelly && <div>
          <SunshineNewUsersList terms={{view:"allUsers", limit: 30}} allowContentPreview={false}/>
        </div>}
      </div>}

    </div>
  )
}

const SunshineSidebarComponent = registerComponent("SunshineSidebar", SunshineSidebar, {
  styles,
  hocs: [withErrorBoundary]
});

declare global {
  interface ComponentTypes {
    SunshineSidebar: typeof SunshineSidebarComponent
  }
}

