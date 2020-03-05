import React, { useState } from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { useUpdate } from '../../lib/crud/withUpdate';
import withUser from '../common/withUser';
import Users from "../../lib/collections/users/collection";
import Dialog from '@material-ui/core/Dialog';
import Geosuggest from 'react-geosuggest';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { createStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { sharedStyles } from './EventNotificationsDialog'
import { useGoogleMaps } from '../form-components/LocationFormComponent'
const suggestionToGoogleMapsLocation = (suggestion) => {
  return suggestion ? suggestion.gmaps : null
}

const styles = createStyles(theme => ({
  ...sharedStyles(theme),
}))

const SetPersonalMapLocationDialog = ({ onClose, currentUser, classes }) => {
  const { mapLocation, googleLocation, mapMarkerText, bio } = currentUser || {}
  const { Loading } = Components
  
  const [ mapsLoaded ] = useGoogleMaps("SetPersonalMapLocationDialog")
  const [ location, setLocation ] = useState(mapLocation || googleLocation)
  const [ label, setLabel ] = useState(mapLocation?.formatted_address || googleLocation?.formatted_address)
  const [ mapText, setMapText ] = useState(mapMarkerText || bio)
  
  const { mutate } = useUpdate({
    collection: Users,
    fragmentName: 'UsersCurrent',
  })

  return (
    <Dialog
      open={true}
      onClose={onClose}
    >
      <DialogTitle>
        Add your location to the map
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2">
            Is this the location you want to display for yourself on the map?
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
        <TextField
            label="Description (Make sure to mention whether you want to organize events)"
            className={classes.modalTextField}
            value={mapText}
            onChange={e => setMapText(e.target.value)}
            fullWidth
            multiline
            rows={4}
            rowsMax={100}
          />
        <DialogActions className={classes.actions}>
          {currentUser?.mapLocation && <a className={classes.removeButton} onClick={()=>{
            mutate({selector: {_id: currentUser._id}, data: {mapLocation: null}})
            onClose()
          }}>
            Remove me from the map
          </a>}
          <a className={classes.submitButton} onClick={()=>{
            mutate({selector: {_id: currentUser._id}, data: {mapLocation: location, mapMarkerText: mapText}})
            onClose()
          }}>
            Submit
          </a>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

const SetPersonalMapLocationDialogComponent = registerComponent('SetPersonalMapLocationDialog', SetPersonalMapLocationDialog, {
  styles,
  hocs: [withUser]
});

declare global {
  interface ComponentTypes {
    SetPersonalMapLocationDialog: typeof SetPersonalMapLocationDialogComponent
  }
}

