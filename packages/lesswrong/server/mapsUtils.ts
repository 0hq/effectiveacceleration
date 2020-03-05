import { getSetting } from './vulcan-lib';
import googleMaps from '@google/maps'

const googleMapsApiKey = getSetting('googleMaps.serverApiKey', null)
let googleMapsClient: any = null
if (googleMapsApiKey) {
  googleMapsClient = googleMaps.createClient({
    key: googleMapsApiKey,
    Promise: Promise
  });
} else {
  // eslint-disable-next-line no-console
  console.log("No Server-side Google maps API key provided, please provide one for proper timezone handling")
}

export async function getLocalTime(time, googleLocation) {
  if (!googleMapsClient) {
    // eslint-disable-next-line no-console
    console.log("No Server-side Google Maps API key provided, can't resolve local time")
    return null
  }
  try {
    const { geometry: { location } } = googleLocation
    const apiResponse = await googleMapsClient.timezone({location, timestamp: new Date(time)}).asPromise()
    const { json: { dstOffset, rawOffset } } = apiResponse //dstOffset and rawOffset are in the unit of seconds
    const localTimestamp = new Date(time).getTime() + ((dstOffset + rawOffset)*1000) // Translate seconds to milliseconds
    return new Date(localTimestamp)
  } catch(err) {
    // eslint-disable-next-line no-console
    console.error("Error in getting local time:", err)
    throw err
  }
}
