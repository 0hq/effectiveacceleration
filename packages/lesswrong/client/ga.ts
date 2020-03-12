import { getSetting } from '../lib/vulcan-lib';
import { addInitFunction, addIdentifyFunction } from '../lib/vulcanEvents';
import LogRocket from 'logrocket'

function googleTagManagerInit() {
  const googleTagManagerId = getSetting('googleTagManager.apiKey')
  if (googleTagManagerId) {
    (function (w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({
      'gtm.start':
        new Date().getTime(), event: 'gtm.js'
    }); var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; 
      (j as any).async = true; 
      (j as any).src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;         
      (f as any).parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', googleTagManagerId)
  }
}

addInitFunction(googleTagManagerInit)

const identifyLogRocketCallback = (currentUser) => {
  const logRocketKey = getSetting<string|undefined>('logRocket.apiKey')
  if (!logRocketKey) return

  LogRocket.init(logRocketKey)
  const { karma = 0, afKarma = 0, frontpagePostCount = 0, voteCount = 0, createdAt, username, displayName: lWDisplayName } = currentUser
  const additionalData = { karma, afKarma, frontpagePostCount, voteCount, createdAt, username, lWDisplayName }
  LogRocket.identify(currentUser._id, {
    // Don't show user display names by default
    displayName: currentUser._id,
    email: currentUser.email,
    // Custom LessWrong variables
    ...additionalData
  })
}

addIdentifyFunction(identifyLogRocketCallback)

