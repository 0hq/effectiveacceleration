/* global google */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { registerComponent, Components } from 'meteor/vulcan:core';
import { Marker, InfoWindow } from "react-google-maps"
import { Link } from 'react-router';
import CloseIcon from '@material-ui/icons/Close';
import { Posts } from 'meteor/example-forum';

class LocalEventMarker extends PureComponent {
  render() {
    const { event, handleMarkerClick, handleInfoWindowClose, infoOpen, location } = this.props;
    const { geometry: {location: {lat, lng}}} = location || {geometry: {location: {lat: -98.44228020000003, lng: 35.1592256}}};

    var arrowIcon = {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        fillColor: '#2b6a99',
        fillOpacity: 0.9,
        scale: 5,
        strokeWeight: 1,
        strokeColor: "#FFFFFF"
    };


    return(
      <Marker
        onClick={() => handleMarkerClick(event._id)}
        key={event._id}
        icon={arrowIcon}
        position={{lat:lat, lng:lng}}
      >
        {infoOpen &&
          <InfoWindow>
            <div style={{width: "250px"}}>
              <a><CloseIcon className="local-group-marker-close-icon" onClick={() => handleInfoWindowClose(event._id)}/></a>
              <Link to={Posts.getPageUrl(event)}><h5 className="local-group-marker-name"> [Event] {event.title} </h5></Link>
              <div className="local-event-marker-body"><Components.DraftJSRenderer content={event.content} /></div>
              {event.contactInfo && <div className="local-group-marker-contact-info">{event.contactInfo}</div>}
              <Link className="local-group-marker-page-link" to={Posts.getPageUrl(event)}> Full link </Link>
              <div className="local-group-links-wrapper"><Components.GroupLinks document={event}/></div>
            </div>
          </InfoWindow>
        }
      </Marker>
    )
  }
}

LocalEventMarker.propTypes = {
  event: PropTypes.object.isRequired,
  location: PropTypes.object,
}

registerComponent("LocalEventMarker", LocalEventMarker);
