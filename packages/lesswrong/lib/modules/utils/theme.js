import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Users from 'meteor/vulcan:users';
import { Posts } from 'meteor/example-forum';

const getHeaderColor_Post = (postId, store) => {
  const post = Posts.findOneInStore(store, postId)
  if (post && (post.frontpage || post.meta)) {
    if (post.meta) {
      return "#E6F2F1"//this.renderHeaderSection_Meta()
    }
    return "#fcfcfc"
  } else if (post && post.userId) {
    const user = Users.findOneInStore(store, post.userId)
    if (user) {
      return "#F0F4F7" //<Link className="header-site-section user" to={ Users.getProfileUrl(user) }>{ user.displayName }</Link>
    }
  }
}

export const customizeTheme = (router, userAgent, params, store) => {
  let routeName = router.name

  let muiTheme = getMuiTheme({
    "fontFamily": "warnock-pro",
    "palette": {
      "primary1Color": "#f5f5f5",
      "primary2Color": "#eeeeee",
      "accent1Color": "rgba(100, 169, 105, 0.5)",
      "accent2Color": "rgba(100, 169, 105, 1)",
      "accent3Color": "#c8e6c9",
      "pickerHeaderColor": "#4caf50",
    },
    "appBar": {
      "textColor": "rgba(0, 0, 0, 0.54)"
    },
    "datePicker": {
      "color": "rgba(0,0,0,0.54)",
      "selectTextColor": "rgba(0,0,0,0.54)",
    },
    "flatButton": {
      "primaryTextColor": "rgba(0,0,0,0.54)"
    },
    userAgent: userAgent,
  });
  muiTheme.palette.header = "#FCFCFC"

  if (routeName == "users.single") {
    muiTheme.palette.header = "#F0F4F7"
    muiTheme.palette.accent1Color = "rgba(130,195,246,.5)"
    muiTheme.palette.accent2Color = "rgba(130,195,246,1)"
  } else if (routeName == "posts.single") {
    muiTheme.palette.header = getHeaderColor_Post(params._id, store)
  } else if (routeName == "Rationality.posts.single" || routeName == "Rationality") {
    muiTheme.palette.header = "#F0F7F1"
  } else if (routeName == "HPMOR.posts.single" || routeName == "HPMOR") {
    muiTheme.palette.header = "#E8E8FA"
    muiTheme.palette.accent1Color = "rgba(117,123,165,.5)"
    muiTheme.palette.accent2Color = "rgb(117,123,165)"

  } else if (routeName == "Codex.posts.single" || routeName == "Codex") {
    muiTheme.palette.header = "#EBF0F2"
    muiTheme.palette.accent1Color = "rgba(136, 172, 184,.5)"
    muiTheme.palette.accent2Color = "rgb(136, 172, 184)"

  } else if (routeName == "Meta") {
    muiTheme.palette.header = "#E6F2F1"
    muiTheme.palette.accent1Color = "rgba(105,201,192,.5)"
    muiTheme.palette.accent2Color = "rgba(105,201,192,1)"
  }
  return muiTheme
}
