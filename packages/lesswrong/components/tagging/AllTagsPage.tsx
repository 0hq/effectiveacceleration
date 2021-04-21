import React, { useState } from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { useTagBySlug } from './useTag';
import { commentBodyStyles } from '../../themes/stylePiping'
import { EditTagForm } from './EditTagPage';
import { userCanEditTagPortal } from '../../lib/betas'
import { useCurrentUser } from '../common/withUser';
import { AnalyticsContext } from "../../lib/analyticsEvents";
import { Link } from '../../lib/reactRouterWrapper';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { useDialog } from '../common/withDialog';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    margin: "auto",
    maxWidth: 1000
  },
  topSection: {
    maxWidth: 800,
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: theme.spacing.unit*8
  },
  alphabetical: {
    columns: 5,
    columnWidth: 200,
    columnGap: 0,
    background: "white",
    padding: 20,
    marginBottom: 24
  },
  portal: {
    marginTop: 18,
    ...commentBodyStyles(theme),
    marginBottom: 18,
    position: "relative",
    [theme.breakpoints.down('xs')]: {
      '& td': {
        display: 'block',
        width: '100% !important',
        height: 'inherit !important'
      }
    }
  },
  edit: {
    float: "right",
    marginRight: 5,
    color: theme.palette.grey[600],
  }
})


const AllTagsPage = ({classes}: {
  classes: ClassesType,
}) => {
  const { openDialog } = useDialog()
  const currentUser = useCurrentUser()
  const { tag } = useTagBySlug("portal", "TagFragment");
  const [ editing, setEditing ] = useState(false)
  // Type hack because MenuItem is too narrowly typed and doesn't properly take into account props-forwarding

  const { AllTagsAlphabetical, SectionButton, SectionTitle, ContentItemBody } = Components;

  return (
    <AnalyticsContext pageContext="allTagsPage">
      <div className={classes.root}>
        <div className={classes.topSection}>
          <AnalyticsContext pageSectionContext="tagPortal">
            <SectionTitle title="EA Forum Wiki">
              <SectionButton>
                <AddBoxIcon/>
                {currentUser ? 
                  <Link to="/tag/create">New Tag</Link> :
                  <a onClick={(ev) => {
                    openDialog({
                      componentName: "LoginPopup",
                      componentProps: {}
                    });
                    ev.preventDefault();
                  }}>New Tag</a>
                }
              </SectionButton>
            </SectionTitle>
            <div className={classes.portal}>
              {userCanEditTagPortal(currentUser) && <a onClick={() => setEditing(true)} className={classes.edit}>
                Edit
              </a>}
              {editing && tag ?
                <EditTagForm tag={tag} successCallback={()=>setEditing(false)}/>
                :
                <ContentItemBody
                  dangerouslySetInnerHTML={{__html: tag?.description?.html || ""}}
                  description={`tag ${tag?.name}`}
                />
              }
            </div>
          </AnalyticsContext>
        </div>
        <AnalyticsContext pageSectionContext="allTagsAlphabetical">
          <AllTagsAlphabetical />
        </AnalyticsContext>
      </div>
    </AnalyticsContext>
  );
}

const AllTagsPageComponent = registerComponent("AllTagsPage", AllTagsPage, {styles});

declare global {
  interface ComponentTypes {
    AllTagsPage: typeof AllTagsPageComponent
  }
}
