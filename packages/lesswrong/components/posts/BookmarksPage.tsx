import { registerComponent, Components } from '../../lib/vulcan-lib';
import React from 'react';
import withErrorBoundary from '../common/withErrorBoundary';
import {AnalyticsContext} from "../../lib/analyticsEvents";
import {useCurrentUser} from "../common/withUser"
import { useContinueReading } from '../recommendations/withContinueReading';

const BookmarksPage = () => {
  const {SingleColumnSection, SectionTitle, BookmarksList, ContinueReadingList} = Components

  const currentUser = useCurrentUser()
  const {continueReading} = useContinueReading();

  if (!currentUser) return <span>You must sign in to view bookmarked posts.</span>


  return <SingleColumnSection>
      <AnalyticsContext listContext={"bookmarksPage"} capturePostItemOnMount>
        <SectionTitle title="Bookmarks"/>
        <BookmarksList/>
        <SectionTitle title="Continue Reading"/>
        <ContinueReadingList continueReading={continueReading}/>
      </AnalyticsContext>
    </SingleColumnSection>
}


const BookmarksPageComponent = registerComponent('BookmarksPage', BookmarksPage, {
  hocs: [withErrorBoundary]
});

declare global {
  interface ComponentTypes {
    BookmarksPage: typeof BookmarksPageComponent
  }
}
