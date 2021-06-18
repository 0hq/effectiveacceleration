import React from 'react'
import { userHasEAHomeHandbook } from '../../lib/betas'
import { PublicInstanceSetting } from '../../lib/instanceSettings'
import { DatabasePublicSetting } from '../../lib/publicSettings'
import { Components, registerComponent } from '../../lib/vulcan-lib'
import { useCurrentUser } from '../common/withUser'

const eaHomeSequenceIdSetting = new PublicInstanceSetting<string | null>('eaHomeSequenceId', null, "optional") // Sequence ID for the EAHomeHandbook sequence
const showSmallpoxSetting = new DatabasePublicSetting<boolean>('showSmallpox', false)
const showHandbookBannerSetting = new DatabasePublicSetting<boolean>('showHandbookBanner', false)

const EAHome = () => {
  const currentUser = useCurrentUser();
  const {
    RecentDiscussionFeed, HomeLatestPosts, EAHomeHandbook, RecommendationsAndCurated, SmallpoxBanner, StickiedPosts,
  } = Components

  const recentDiscussionCommentsPerPost = (currentUser && currentUser.isAdmin) ? 4 : 3;
  const shouldRenderEAHomeHandbook = showHandbookBannerSetting.get() && userHasEAHomeHandbook(currentUser)
  const shouldRenderSmallpox = showSmallpoxSetting.get()

  return (
    <React.Fragment>
      {shouldRenderEAHomeHandbook && <EAHomeHandbook documentId={eaHomeSequenceIdSetting.get()}/>}
      
      {shouldRenderSmallpox && <SmallpoxBanner/>}

      <StickiedPosts />
      <HomeLatestPosts />

      <RecommendationsAndCurated configName="frontpageEA" />
      <RecentDiscussionFeed
        af={false}
        commentsLimit={recentDiscussionCommentsPerPost}
        maxAgeHours={18}
      />
    </React.Fragment>
  )
}

const EAHomeComponent = registerComponent('EAHome', EAHome)

declare global {
  interface ComponentTypes {
    EAHome: typeof EAHomeComponent
  }
}
