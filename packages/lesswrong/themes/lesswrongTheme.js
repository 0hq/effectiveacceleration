import createLWTheme from './createThemeDefaults.js';
import grey from '@material-ui/core/colors/grey';
import deepOrange from '@material-ui/core/colors/deepOrange';

const sansSerifStack = [
  'Calibri',
  '"Gill Sans"',
  '"Gill Sans MT"',
  "Myriad Pro",
  'Myriad',
  '"DejaVu Sans Condensed"',
  '"Liberation Sans"',
  '"Nimbus Sans L"',
  'Tahoma',
  'Geneva',
  '"Helvetica Neue"',
  'Helvetica',
  'Arial',
  'sans-serif'
].join(',')

const serifStack = [
  'warnock-pro',
  'Palatino',
  '"Palatino Linotype"',
  '"Palatino LT STD"',
  '"Book Antiqua"',
  'Georgia',
  'serif'
].join(',')

const palette = {
  primary: {
    main: '#5f9b65',
  },
  secondary: {
    main: '#5f9b65',
  },
  lwTertiary: {
    main: "#69886e"
  },
  error: {
    main: deepOrange[900]
  },
  background: {
    default: '#fff'
  }
}

const theme = createLWTheme({
  palette: palette,
  typography: {
    fontFamily: sansSerifStack,
    postStyle: {
      fontFamily: serifStack,
      linkUnderlinePosition: "72%",
    },
    headerStyle: {
      fontFamily: serifStack,
      linkUnderlinePosition: "72%",
    },
    body2: {
      fontSize: "1.16rem"
    },
    commentStyle: {
      fontFamily: sansSerifStack
    },
    headline: {
      fontFamily: serifStack,
    },
    subheading: {
      fontFamily: serifStack,
    },
    title: {
      fontFamily: serifStack,
      fontWeight: 500,
    }
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: grey[50],
      }
    },
    PostsVote: {
      voteScores: {
        margin: "25% 15% 15% 15%"
      }
    },
    MuiTooltip: {
      tooltip: {
        fontSize: "1rem",
        padding: ".7rem",
      }
    },
    MuiDialogContent: {
      root: {
        fontFamily: sansSerifStack,
        fontSize: "1.16rem",
        lineHeight: "1.5em"
      }
    },
    MuiMenuItem: {
      root: {
        fontFamily: sansSerifStack,
        color: grey[800],
        fontSize: "1.1rem",
        lineHeight: "1em"
      }
    },
    MuiListItem: {
      root: {
        paddingTop: 8,
        paddingBottom: 8
      }
    },
    MuiCard: {
      root: {
        borderRadius: 1,
        border: `solid 1px rgba(0,0,0,.2)`,
        boxShadow: "0 0 10px rgba(0,0,0,.2)",
      }
    }
  }
});

export default theme
