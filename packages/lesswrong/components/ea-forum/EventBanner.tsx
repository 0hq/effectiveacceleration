import React from 'react'
import { createStyles } from '@material-ui/core/styles'
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { SECTION_WIDTH } from '../common/SingleColumnSection';
import { cloudinaryCloudNameSetting, DatabasePublicSetting } from '../../lib/publicSettings';
import { Link } from '../../lib/reactRouterWrapper';

const eventBannerMobileImageSetting = new DatabasePublicSetting<string | null>('eventBannerMobileImage', null)
const eventBannerDesktopImageSetting = new DatabasePublicSetting<string | null>('eventBannerDesktopImage', null)
const eventBannerLinkSetting = new DatabasePublicSetting<string | null>('eventBannerLink', null)

const bannerHeight = 250
const container = cloudinaryCloudNameSetting.get()
const mobileImageId = eventBannerMobileImageSetting.get()
const desktopImageId = eventBannerDesktopImageSetting.get()
const featuredPost = eventBannerLinkSetting.get()

const mobileImage = `https://res.cloudinary.com/${container}/image/upload/w_${SECTION_WIDTH},h_${bannerHeight}/${mobileImageId}`
const desktopImage = `https://res.cloudinary.com/${container}/image/upload/w_${SECTION_WIDTH},h_${bannerHeight}/${desktopImageId}`

const styles = createStyles((theme: ThemeType): JssStyles => ({
  link: {
    '&:hover': {
      opacity: 'unset'
    }
  },
  image: {
    height: bannerHeight,
    width: '100%',
    objectFit: 'cover',
  }
}))

const EventBanner = ({ classes }) => {
  const { SingleColumnSection } = Components
  
  return <SingleColumnSection>
    <Link to={featuredPost} className={classes.link}>
      <picture>
        <source media="(max-width: 959.95px)" srcSet={mobileImage} />
        <source media="(min-width: 960px)" srcSet={desktopImage} />
        <img className={classes.image} src={desktopImage} />
      </picture>
    </Link>
  </SingleColumnSection>
}

const EventBannerComponent = registerComponent(
  'EventBanner', EventBanner, {styles},
)

declare global {
  interface ComponentTypes {
    EventBanner: typeof EventBannerComponent
  }
}
