import { Components, registerComponent, getFragment } from '../../lib/vulcan-lib';
import { useMessages } from '../common/withMessages';
import React from 'react';
import { useNavigation } from '../../lib/routeUtil';
import Sequences from '../../lib/collections/sequences/collection';
import { useCurrentUser } from '../common/withUser';
import { legacyBreakpoints } from '../../lib/utils/theme';

// Also used by SequencesEditForm
export const styles = (theme: ThemeType): JssStyles => ({
  sequencesForm: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
  
    "& .input-title .form-input-errors": {
      backgroundColor: "rgba(0,0,0,0.25)",
      width: "100%",
      textAlign: "center",
      margin: "0 !important",
  
      "& li": {
        position: "relative",
        left: -230,
        top: 3,
        zIndex: 3,
        [theme.breakpoints.down('sm')]: {
          left: 0,
        }
      }
    },
    
    "& .input-contents": {
      marginTop: 20,
    },
  
    "& .editor-form-component": {
      maxWidth: 650,
      margin: "auto",
      position: "relative",
      padding: 10,
    },
  
    "& .form-input-errors": {
      fontSize: "1em",
      zIndex: 2,
      textAlign: "left",
    },
  
    "& .vulcan-form": {
      position: "absolute",
      width: "100%",
      paddingBottom: 50,
      overflow: "hidden",
  
      "& .form-input": {
        maxWidth: 640,
        position: "relative !important",
        left: 45,
        marginLeft: "auto",
        marginRight: "auto",
        [theme.breakpoints.down('sm')]: {
          left: 0,
          padding: "0 10px",
        }
      },
      "& .form-input.input-title, &.input-bannerImageId": {
        maxWidth: "100%",
        width: "100%",
        margin: 0,
        left: 0,
        padding: 0,
      },
      "& > form > .form-errors": {
        display: "none",
      },
      "& .form-input.form-component-checkbox > .form-group > label": {
        display: "none",
      },
      "& .form-input.input-bannerImageId": {
        marginTop: 65,
        position: "absolute !important",
        left: 0,
        maxWidth: "100%",
  
        [theme.breakpoints.down('sm')]: {
          marginTop: 40,
          padding: 0,
        },
        "& .form-input-errors": {
          position: "absolute",
          top: 84,
          left: 7,
          textAlign: "left",
        }
      }
    },
  
    "& .form-submit": {
      width: 200,
      margin: "0 auto",
    },
    
    
    "& .input-bannerImageId": {
      "& .image-upload-button": {
        position: "absolute !important",
        left: 15,
        top: 15,
        [theme.breakpoints.down('sm')]: {
          left: 15,
          top: 40,
        },
        [legacyBreakpoints.maxTiny]: {
          left: 12,
          top: 15,
        }
      },
    
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
    }
  },
});

const SequencesNewForm = ({ redirect, cancelCallback, removeSuccessCallback, classes }: {
  redirect: any,
  cancelCallback: any,
  removeSuccessCallback: any,
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const { flash } = useMessages();
  const { history } = useNavigation();
  
  if (currentUser) {
    return (
      <div className={classes.sequencesForm}>
        <Components.WrappedSmartForm
          collection={Sequences}
          successCallback={(sequence) => {
            history.push({pathname: redirect || '/s/' + sequence._id });
            flash({messageString: "Successfully created Sequence", type: "success"});
          }}
          cancelCallback={cancelCallback}
          removeSuccessCallback={removeSuccessCallback}
          prefilledProps={{userId: currentUser._id}}
          queryFragment={getFragment('SequencesEdit')}
          mutationFragment={getFragment('SequencesPageFragment')}
        />
      </div>
    )
  } else {
    return <h3>You must be logged in to create a new sequence.</h3>
  }
}

const SequencesNewFormComponent = registerComponent('SequencesNewForm', SequencesNewForm, {styles});

declare global {
  interface ComponentTypes {
    SequencesNewForm: typeof SequencesNewFormComponent
  }
}
