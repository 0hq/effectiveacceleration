import React, { useState, useCallback } from 'react';
import { Components, registerComponent, } from '../../lib/vulcan-lib';
import { useSingle } from '../../lib/crud/withSingle';
import { sequenceGetPageUrl } from '../../lib/collections/sequences/helpers';
import NoSSR from 'react-no-ssr';
import { userCanDo, userOwns } from '../../lib/vulcan-users/permissions';
import { useCurrentUser } from '../common/withUser';
import { legacyBreakpoints } from '../../lib/utils/theme';
import { postBodyStyles } from '../../themes/stylePiping'
import { sectionFooterLeftStyles } from '../users/UsersProfile'
import {AnalyticsContext} from "../../lib/analyticsEvents";

export const sequencesImageScrim = (theme: ThemeType) => ({
  position: 'absolute',
  bottom: 0,
  height: 150,
  width: '100%',
  zIndex: theme.zIndexes.sequencesImageScrim,
  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.2) 42%, rgba(255, 255, 255, 0) 100%)'
})

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    paddingTop: 380,
  },
  titleWrapper: {
    paddingLeft: theme.spacing.unit/2
  },
  title: {
    fontFamily: theme.typography.uiSecondary.fontFamily,
    fontVariant: "small-caps",
    marginTop: 0,
  },
  description: {
    marginTop: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit/2,
    marginBottom: theme.spacing.unit * 2,
    ...postBodyStyles(theme),
  },
  banner: {
    position: "absolute",
    right: 0,
    top: 60,
    width: "100vw",
    height: 380,
    [legacyBreakpoints.maxTiny]: {
      top: 40,
    },
    "& img": {
      width: "100vw",
    },
  },
  bannerWrapper: {
    position: "relative",
    height: 380,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  meta: {
    ...theme.typography.body2,
    ...sectionFooterLeftStyles
  },
  metaItem: {
    marginRight: theme.spacing.unit
  },
  content: {
    padding: theme.spacing.unit * 4,
    position: 'relative',
    backgroundColor: 'white',
    marginTop: -200,
    zIndex: theme.zIndexes.sequencesPageContent,
    [theme.breakpoints.down('sm')]: {
      marginTop: -100,
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing.unit,
      padding: theme.spacing.unit
    },
  },
  leftAction: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'left'
    }
  },
  imageScrim: {
    ...sequencesImageScrim(theme)
  }
})

const SequencesPage = ({ documentId, classes }: {
  documentId: string,
  classes: ClassesType
}) => {
  const [edit,setEdit] = useState(false);
  const [showNewChapterForm,setShowNewChapterForm] = useState(false);
  const currentUser = useCurrentUser();
  const { document, loading } = useSingle({
    documentId,
    collectionName: "Sequences",
    fragmentName: 'SequencesPageFragment',
  });

  const showEdit = useCallback(() => {
    setEdit(true);
  }, []);
  const showSequence = useCallback(() => {
    setEdit(false);
  }, []);

  const { SequencesEditForm, HeadTags, CloudinaryImage, SingleColumnSection, SectionSubtitle,
    ChaptersList, ChaptersNewForm, FormatDate, Loading, SectionFooter, UsersName,
    ContentItemBody, Typography, SectionButton,
  } = Components
  
  if (document && document.isDeleted) return <h3>This sequence has been deleted</h3>
  if (loading || !document) return <Loading />
  if (edit) return (
    <SequencesEditForm
      documentId={documentId}
      successCallback={showSequence}
      cancelCallback={showSequence}
    />
  )

  const canEdit = userCanDo(currentUser, 'sequences.edit.all') || (userCanDo(currentUser, 'sequences.edit.own') && userOwns(currentUser, document))
  const canCreateChapter = userCanDo(currentUser, 'chapters.new.all')
  const { html = "" } = document.contents || {}

  return <div className={classes.root}>
    <HeadTags canonicalUrl={sequenceGetPageUrl(document, true)} title={document.title}/>
    <div className={classes.banner}>
      <div className={classes.bannerWrapper}>
        <NoSSR>
          <div>
            <CloudinaryImage
              publicId={document.bannerImageId || "sequences/vnyzzznenju0hzdv6pqb.jpg"}
              width="auto"
              height="380"
            />
            <div className={classes.imageScrim}/>
          </div>
        </NoSSR>
      </div>
    </div>
    <SingleColumnSection>
      <div className={classes.content}>
        <div className={classes.titleWrapper}>
          <Typography variant='display2' className={classes.title}>
            {document.draft && <span>[Draft] </span>}{document.title}
          </Typography>
        </div>
        <SectionFooter>
          <div className={classes.meta}>
            <span className={classes.metaItem}><FormatDate date={document.createdAt} format="MMM DD, YYYY"/></span>
            {document.user && <span className={classes.metaItem}> by <UsersName user={document.user}>
              {document.user.displayName}
            </UsersName></span>}
          </div>
          {canEdit && <span className={classes.leftAction}><SectionSubtitle>
            <a onClick={showEdit}>edit</a>
          </SectionSubtitle></span>}
        </SectionFooter>
        
        <div className={classes.description}>
          {html && <ContentItemBody dangerouslySetInnerHTML={{__html: html}} description={`sequence ${document._id}`}/>}
        </div>
        <div>
          <AnalyticsContext listContext={"sequencePage"} sequenceId={document._id} capturePostItemOnMount>
            <ChaptersList sequenceId={document._id} canEdit={canEdit} />
          </AnalyticsContext>
          {canCreateChapter && <SectionFooter>
            <SectionButton>
              <a onClick={() => setShowNewChapterForm(true)}>Add Chapter</a>
            </SectionButton>
          </SectionFooter>}
          {showNewChapterForm && <ChaptersNewForm prefilledProps={{sequenceId: document._id}}/>}
        </div>
      </div>
    </SingleColumnSection>
  </div>
}

const SequencesPageComponent = registerComponent('SequencesPage', SequencesPage, {styles});

declare global {
  interface ComponentTypes {
    SequencesPage: typeof SequencesPageComponent
  }
}
