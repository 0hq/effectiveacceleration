import createLWTheme from './createThemeDefaults';
import deepOrange from '@material-ui/core/colors/deepOrange';
import indigo from '@material-ui/core/colors/indigo';

const sansSerifStack = [
  'GreekFallback', // Ensures that greek letters render consistently
  '"freight-sans-pro"',
  'Frutiger',
  '"Frutiger Linotype"',
  'Univers',
  'Calibri',
  '"Gill Sans"',
  '"Gill Sans MT"',
  "Myriad Pro",
  'Myriad',
  '"Liberation Sans"',
  '"Nimbus Sans L"',
  'Tahoma',
  'Geneva',
  '"Helvetica Neue"',
  'Helvetica',
  'Arial',
  'sans-serif'
].join(',')

const palette = {
  primary: indigo,
  secondary: indigo,
  lwTertiary: {
    main: "#607e88"
  },
  error: {
    main: deepOrange[900]
  },
  background: {
    default: '#fff'
  },
  headerType: "primary"
}

const theme = createLWTheme({
  palette: palette,
  typography: {
    fontFamily: sansSerifStack,
    postStyle: {
      fontFamily: sansSerifStack,
      fontVariantNumeric: "lining-nums",
    },
    commentStyle: {
      fontFamily: sansSerifStack,
      fontVariantNumeric: "lining-nums",
    },
    errorStyle: {
      color: palette.error.main,
      fontFamily: sansSerifStack
    },
    title: {
      fontWeight: 500,
    },
    display2: {
      fontWeight: 500
    },
    display3: {
      fontWeight: 500
    },
    uiSecondary: {
      fontFamily: sansSerifStack,
    },
  },
  overrides: {
    Header: {
      titleLink: {
        top: 0
      }
    },
    MuiTooltip: {
      tooltip: {
        fontSize: "1rem"
      }
    },
    PostsVote: {
      voteScores: {
        fontVariantNumeric: "lining-nums",
      }
    },
    SectionTitle: {
      leftDivider: {
        width: 18,
        marginTop: 4
      },
      rightDivider: {
        marginTop: 4,
        marginRight: 8,
      },
      tailDivider: {
        marginTop: 4,
        width: 24,
      }
    },
    SectionButton: {
      root: {
        marginTop: 4,
        fontWeight: 500,
      }
    },
    LoadMore: {
      root: {
        fontWeight: 500,
      }
    }
  }
});

export default theme
