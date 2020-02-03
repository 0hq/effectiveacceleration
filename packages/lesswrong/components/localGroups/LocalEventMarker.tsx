import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { Posts } from '../../lib/collections/posts';
import { Marker } from 'react-map-gl';
import { createStyles } from '@material-ui/core/styles';
import { ArrowSVG } from './Icons'

const styles = createStyles(theme => ({
  icon: {
    width: 15, 
    height: 15,
    fill: '#2b6a99',
    opacity: 0.8
  }
}))

const LocalEventMarker = ({ event, handleMarkerClick, handleInfoWindowClose, infoOpen, location, classes }) => {
  if (!location?.geometry?.location?.lat || !location?.geometry?.location?.lng) return null
  const { geometry: {location: {lat, lng}}} = location
  const { htmlHighlight = "" } = event.contents || {}
  const { GroupLinks, StyledMapPopup } = Components
  
  const htmlBody = {__html: htmlHighlight};

  return <React.Fragment>
    <Marker
      latitude={lat}
      longitude={lng}
      offsetLeft={-7}
      offsetTop={-25}
    >
      <span onClick={() => handleMarkerClick(event._id)}>
        <ArrowSVG className={classes.icon}/>
      </span>
    </Marker>
    {infoOpen && 
      <StyledMapPopup
        lat={lat}
        lng={lng}
        link={Posts.getPageUrl(event)}
        title={` [Event] ${event.title} `}
        metaInfo={event.contactInfo}
        cornerLinks={<GroupLinks document={event}/>}
        onClose={() => handleInfoWindowClose(event._id)}
        offsetTop={-25}
      >
        <div dangerouslySetInnerHTML={htmlBody} />
      </StyledMapPopup>}
  </React.Fragment>
}

const LocalEventMarkerComponent = registerComponent("LocalEventMarker", LocalEventMarker, {styles});

declare global {
  interface ComponentTypes {
    LocalEventMarker: typeof LocalEventMarkerComponent
  }
}

