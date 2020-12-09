import React, { useState } from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { useUpdateCurrentUser } from '../hooks/useUpdateCurrentUser';
import { useCurrentUser } from '../common/withUser';
import Geosuggest from 'react-geosuggest';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slider from '@material-ui/lab/Slider';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormLabel from '@material-ui/core/FormLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { geoSuggestStyles, useGoogleMaps } from '../form-components/LocationFormComponent'
import { MAX_NOTIFICATION_RADIUS } from '../../lib/collections/users/custom_fields'


const suggestionToGoogleMapsLocation = (suggestion) => {
  return suggestion ? suggestion.gmaps : null
}

export const sharedStyles = (theme: ThemeType): JssStyles => ({
  removeButton: {
    color: theme.palette.error.main,
    marginRight: 'auto',
    marginLeft: -4
  },
  submitButton: {
    color: theme.palette.secondary.main,
    textTransform: 'uppercase'
  },
  actions: {
    marginTop: 24
  },
  geoSuggest: {
    marginTop: 16, 
    marginBottom: 16,
    width: 400,
    ...geoSuggestStyles(theme),
    "& .geosuggest__suggests": {
      top: "100%",
      left: 0,
      right: 0,
      maxHeight: "25em",
      padding: 0,
      marginTop: -1,
      background: "#fff",
      borderTopWidth: 0,
      overflowX: "hidden",
      overflowY: "auto",
      listStyle: "none",
      zIndex: 5,
      transition: "max-height 0.2s, border 0.2s",
    },
    "& .geosuggest__input": {
      border: "2px solid transparent",
      borderBottom: "1px solid rgba(0,0,0,.87)",
      padding: ".5em 1em 0.5em 0em !important",
      width: '100%',
      fontSize: 13,
      [theme.breakpoints.down('sm')]: {
        width: "100%"
      },
    },
  },
})

const styles = (theme: ThemeType): JssStyles => ({
  ...sharedStyles(theme),
  distanceSection: {
    marginTop: 30,
    display: 'flex'
  },
  input: {
    width: '15%',
    marginLeft: '5%',
    position: 'relative',
    top: -12
  },
  slider: {
    width: '80%',
  },
  inputAdornment: {
    marginLeft: 0,
  },
  distanceHeader: {
    marginTop: 20
  },
  peopleThreshold: {
    display: 'flex'
  },
  peopleThresholdText: {
    alignSelf: 'center',
    position: 'relative',
    top: 2
  },
  peopleInput: {
    width: 20
  },
  peopleThresholdCheckbox: {
    marginLeft: -12
  }
})

const MAX_NOTIFICATION_RADIUS_STEPSIZE = 5
const EventNotificationsDialog = ({ onClose, classes }: {
  onClose: ()=>void,
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const { Loading, Typography, LWDialog } = Components
  const { nearbyEventsNotificationsLocation, mapLocation, googleLocation, nearbyEventsNotificationsRadius, nearbyPeopleNotificationThreshold } = currentUser || {}

  const [ mapsLoaded ] = useGoogleMaps("EventNotificationsDialog")
  const [ location, setLocation ] = useState(nearbyEventsNotificationsLocation || mapLocation || googleLocation)
  const [ label, setLabel ] = useState(nearbyEventsNotificationsLocation?.formatted_address || mapLocation?.formatted_address || googleLocation?.formatted_address)
  const [ distance, setDistance ] = useState(nearbyEventsNotificationsRadius || 50)
  const [ notifyPeopleThreshold, setNotifyPeopleThreshold ] = useState(nearbyPeopleNotificationThreshold || 10)
  const [ notifyPeopleCheckboxState, setNotifyPeopleCheckboxState ] = useState(!!nearbyPeopleNotificationThreshold)
  
  const updateCurrentUser = useUpdateCurrentUser()

  const peopleThresholdInput = <Input
    className={classes.peopleInput}
    value={notifyPeopleThreshold}
    margin="dense"
    onChange={(e) => setNotifyPeopleThreshold(parseFloat(e.target.value))}
  />

  return (
    <LWDialog
      open={true}
      onClose={onClose}
    >
      <DialogTitle>
        I wish to be notified of nearby events and new groups
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          <p>
            Notify me for events and new groups in this location 
          </p>
        </Typography>
        <div className={classes.geoSuggest}>
          {mapsLoaded ? <Geosuggest
            placeholder="Location"
            onSuggestSelect={(suggestion) => { 
              setLocation(suggestionToGoogleMapsLocation(suggestion))
              setLabel(suggestion?.label)
            }}
            initialValue={label}
          /> : <Loading/>}
          
        </div>
        <FormLabel className={classes.distanceHeader} component={"legend" as any}>Notification Radius</FormLabel>
        <div className={classes.distanceSection}>
          <Slider
            className={classes.slider}
            value={distance}
            step={MAX_NOTIFICATION_RADIUS_STEPSIZE}
            min={0}
            max={MAX_NOTIFICATION_RADIUS}
            onChange={(e, value) => setDistance(value)}
            aria-labelledby="input-slider"
          />
          <Input
            className={classes.input}
            value={distance}
            margin="dense"
            onChange={(e) => setDistance(parseFloat(e.target.value))}
            endAdornment={<InputAdornment disableTypography className={classes.inputAdornment} position="end">km</InputAdornment>}
            onBlur={() => setDistance(distance > MAX_NOTIFICATION_RADIUS ? MAX_NOTIFICATION_RADIUS : (distance < 0 ? 0 : distance))}
            inputProps={{
              step: MAX_NOTIFICATION_RADIUS_STEPSIZE,
              min: 0,
              max: MAX_NOTIFICATION_RADIUS,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </div>
        <div className={classes.peopleThreshold}>
          <div>
            <Checkbox
              className={classes.peopleThresholdCheckbox}
              checked={notifyPeopleCheckboxState}
              onChange={(e) => setNotifyPeopleCheckboxState(!!e.target.checked)}
            />
          </div>
          <div className={classes.peopleThresholdText}>
            Notify me when there are {peopleThresholdInput} or more people in my area
          </div>
        </div>
        <DialogActions className={classes.actions}>
          {currentUser?.nearbyEventsNotifications && <a className={classes.removeButton} onClick={()=>{
            void updateCurrentUser({
              nearbyEventsNotifications: false,
              nearbyEventsNotificationsLocation: null, 
              nearbyEventsNotificationsRadius: null, 
              nearbyPeopleNotificationThreshold: null,
            })
            onClose()
          }}>
            Stop notifying me
          </a>}
          <a className={classes.submitButton} onClick={()=>{
            void updateCurrentUser({
              nearbyEventsNotifications: true,
              nearbyEventsNotificationsLocation: location, 
              nearbyEventsNotificationsRadius: distance, 
              nearbyPeopleNotificationThreshold: notifyPeopleCheckboxState ? notifyPeopleThreshold : null,
            })
            onClose()
          }}>
            Submit
          </a>
        </DialogActions>
      </DialogContent>
    </LWDialog>
  )
}

const EventNotificationsDialogComponent = registerComponent('EventNotificationsDialog', EventNotificationsDialog, {styles});

declare global {
  interface ComponentTypes {
    EventNotificationsDialog: typeof EventNotificationsDialogComponent
  }
}

