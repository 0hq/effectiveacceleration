import { Components, registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import { AnalyticsContext } from "../../lib/analyticsEvents";
import { reviewIsActive } from '../../lib/reviewUtils';
import { useCurrentUser } from './withUser';

const Home2 = () => {
  const { RecentDiscussionFeed, HomeLatestPosts, AnalyticsInViewTracker, RecommendationsAndCurated, FrontpageReviewWidget, SingleColumnSection } = Components

  const currentUser = useCurrentUser()

  return (
      <AnalyticsContext pageContext="homePage">
        <React.Fragment>
          {(!reviewIsActive() || !currentUser) && <RecommendationsAndCurated configName="frontpage" />}
          {reviewIsActive() && <SingleColumnSection>
            <FrontpageReviewWidget />
          </SingleColumnSection>}
          <AnalyticsInViewTracker
              eventProps={{inViewType: "latestPosts"}}
              observerProps={{threshold:[0, 0.5, 1]}}
          >
            <HomeLatestPosts />
          </AnalyticsInViewTracker>
          <AnalyticsContext pageSectionContext="recentDiscussion">
            <AnalyticsInViewTracker eventProps={{inViewType: "recentDiscussion"}}>
              <RecentDiscussionFeed
                af={false}  
                commentsLimit={4}
                maxAgeHours={18}
              />
            </AnalyticsInViewTracker>
          </AnalyticsContext>
        </React.Fragment>
      </AnalyticsContext>
  )
}

const Home2Component = registerComponent('Home2', Home2);

declare global {
  interface ComponentTypes {
    Home2: typeof Home2Component
  }
}
