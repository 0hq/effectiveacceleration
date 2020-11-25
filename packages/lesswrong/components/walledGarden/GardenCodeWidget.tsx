import React, { useState } from 'react';
import { registerComponent, Components, getFragment } from '../../lib/vulcan-lib';
import { GardenCodes } from "../../lib/collections/gardencodes/collection";
import {Button, TextField} from "@material-ui/core";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {commentBodyStyles} from "../../themes/stylePiping";
import { useTracking } from "../../lib/analyticsEvents";
import { useCurrentUser } from '../common/withUser';
import moment from 'moment';

export const gardenForm = theme => ({
  ...commentBodyStyles(theme),
  border: "solid 1px rgba(0,0,0,.2)",
  borderRadius: 3,
  padding: 12,
  paddingTop: 8,
  paddingBottom: 8,
  backgroundColor: "white",
  maxWidth: 350,
  '& .MuiInput-input': {
    maxWidth: 300
  }
})

const styles = (theme: ThemeType): JssStyles => ({
  button: {
    marginTop: 8,
    marginBottom: 8,
    width: 135
  },
  root: {
    ...gardenForm(theme)
  },
  row: {
    display: "flex",
    justifyContent: "space-between"
  },
  inviteCode: {

  }
})

export const GardenCodeWidget = ({classes}:{classes:ClassesType}) => {

  const { captureEvent } = useTracking()
  const currentUser =  useCurrentUser()

  const [currentCode, setCurrentCode] = useState<GardenCodeFragment|null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [open, setOpen] = useState(false)

  const autoselectCode = (event) => {
    event.target.select()
  }

  const generatedLink = `http://garden.lesswrong.com?code=${currentCode?.code}&event=${currentCode?.slug}`

  if (!currentUser) return null

  if (!open) return <Button className={classes.button} variant="outlined" onClick={() => setOpen(true)}>MAKE INVITE LINKS</Button>
  const fields = ["title", "startTime"]

  return <div className={classes.root}>
    <div className={classes.row}>
      <h3>Generate Invite Links</h3>
      <a className={classes.hide} onClick={()=>setOpen(false)}>X</a>
    </div>
    {!!currentCode
      ? <div>
            Here is your code! It is valid from <strong>{moment(new Date(currentCode.startTime)).format("dddd, MMMM Do, h:mma")}</strong> until <strong>{moment(new Date(currentCode.endTime)).format("h:mma")}</strong>.
            <TextField
              className={classes.inviteCode}
              // label={"Your code!"}
              onClick={autoselectCode}
              onSelect={autoselectCode}
              value={generatedLink}
              fullWidth
            />
            <CopyToClipboard
              text={generatedLink}
              onCopy={(text, result) => {
              setCopiedCode(result);
              captureEvent("gardenCodeLinkCopied", {generatedLink})
              }}
              >
              <Button color="primary">{copiedCode ? "Copied!" : "Copy Link"}</Button>
            </CopyToClipboard>
            <Button onClick={() => {
              setCurrentCode(null)
              setCopiedCode(false)
            }}>
              Generate New Code
            </Button>
          </div>
      : <div>
          <div>
            <p>Use invite links to set up co-working, general hangouts, and other events.</p>
            <p>
              Feel free to invite anyone who is considerate of those around them.
              Invite codes are valid for 4 hours from start time.
            </p>
          </div>
          <Components.WrappedSmartForm
            collection={GardenCodes}
            fields={fields}
            mutationFragment={getFragment("GardenCodeFragment")}
            queryFragment={getFragment("GardenCodeFragment")}
            successCallback={code => setCurrentCode(code)}/>
      </div>
    }
  </div>
}

const GardenCodeWidgetComponent = registerComponent('GardenCodeWidget', GardenCodeWidget, {styles});

declare global {
  interface ComponentTypes {
    GardenCodeWidget: typeof GardenCodeWidgetComponent
  }
}

