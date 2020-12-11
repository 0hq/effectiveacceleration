import React, { useState } from 'react';
import { registerComponent, Components, getFragment } from '../../lib/vulcan-lib';
import { GardenCodes } from "../../lib/collections/gardencodes/collection";
import {Button, TextField} from "@material-ui/core";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {commentBodyStyles} from "../../themes/stylePiping";
import { useTracking } from "../../lib/analyticsEvents";
import { useCurrentUser } from '../common/withUser';
import moment from 'moment';
import { useGlobalKeydown } from '../common/withGlobalKeydown';
import classNames from 'classnames';

export const gardenForm = theme => ({
  ...commentBodyStyles(theme, true),
  border: "solid 1px rgba(0,0,0,.2)",
  borderRadius: 3,
  padding: 8,
  backgroundColor: "white",
  maxWidth: 400,
  '& .MuiInput-formControl': {
    width: 320
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
  formSubmitRow: {
    display: "flex",
    justifyContent: "flex-end"
  },
  submitButton: {
    color: theme.palette.primary.main
  }
})

export const GardenCodeWidget = ({classes, type}:{classes:ClassesType, type: string}) => {

  const { captureEvent } = useTracking()
  const currentUser =  useCurrentUser()

  const [currentCode, setCurrentCode] = useState<GardenCodeFragment|null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [open, setOpen] = useState(false)

  const autoselectCode = (event) => {
    event.target.select()
  }

  const keyDown = useGlobalKeydown((event: KeyboardEvent) => {
    const Return_KeyCode = 13
    const ReturnKey = "Enter"
    if (event.key === ReturnKey || event.keyCode === Return_KeyCode) {
      event.preventDefault()
    }
  });

  const SubmitComponent = () => <div className={classNames("form-submit", classes.formSubmitRow)}>
      <Button onClick={()=>setOpen(false)}>
        Cancel
      </Button>
      <Button
        type="submit"
        className={classes.submitButton}
        onClick={(ev) => {
          if (!currentUser) {
            ev.preventDefault();
          }
        }}
      >
        Submit
      </Button>
    </div>

  const generatedLink = `http://garden.lesswrong.com?code=${currentCode?.code}&event=${currentCode?.slug}`

  if (!currentUser) return null
  const label = type === "friend" ? "Invite a Friend" : "Host Event"

  if (!open) return <Button className={classes.button} variant="outlined" onClick={() => setOpen(true)}>{label}</Button>

  const fields = type === "friend" ? ["title", "startTime"] : ["title", "startTime", "contents", "type"]

  return <div className={classes.root} {...keyDown}>
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
            {/* {type === "event" && <div><a href={"https://www.facebook.com/events/create/?group_id=356586692361618"} target="_blank" rel="noopener noreferrer">
              <Button variant="outlined" className={classes.fbEventButton}>Create FB Event</Button>
            </a></div>} */}
          </div>
      : <div>
          {type === "friend" && <div>
            <p>Use invite links to set up co-working, general hangouts, and other events.</p>
            <p>
              Feel free to invite anyone who is considerate of those around them.
              Invite codes are valid for 4 hours from start time.
            </p>
          </div>}
          <Components.WrappedSmartForm
            collection={GardenCodes}
            fields={fields}
            mutationFragment={getFragment("GardenCodeFragment")}
            queryFragment={getFragment("GardenCodeFragment")}
            formComponents={{
              FormSubmit: SubmitComponent,
              FormGroupLayout: Components.DefaultStyleFormGroup
            }}
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

