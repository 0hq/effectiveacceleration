import { linkStyle } from './createThemeDefaults'
import deepmerge from 'deepmerge';
import isPlainObject from 'is-plain-object';

const spoilerStyles = theme => ({
  '& p.spoiler': {
    margin: 0,
  },
  '& .spoiler': {
    backgroundColor: 'black',
    padding: 8,
    color: 'black',
    pointerEvents: 'auto',
    minHeight: theme.typography.commentStyle.fontSize,
    '& .public-DraftStyleDefault-block': {
      margin: 0,
    },
  },
  '& .spoiler:before': {
    content: '"spoiler (hover/select to reveal)"',
    color: 'white',
    position: 'absolute',
    left: 20
  },
  '& .spoiler:after': {
    content: '"\\00a0"',
  },
  '&:hover .spoiler': {
    color: 'white',
  },
  '&:hover .spoiler:before': {
    color: 'black',
    content: '""'
  },
})

export const postBodyStyles = (theme, fontSize) => {
  return {
    ...theme.typography.body1,
    ...theme.typography.postStyle,
    ...spoilerStyles(theme),
    '& pre': {
      ...theme.typography.codeblock
    },
    '& code': {
      ...theme.typography.code
    },
    '& blockquote': {
      ...theme.typography.blockquote,
      ...theme.typography.body1,
      ...theme.typography.postStyle
    },
    '& li': {
      ...theme.typography.body1,
      ...theme.typography.li,
      ...theme.typography.postStyle
    },
    '& h1': {
      ...theme.typography.display2,
      ...theme.typography.postStyle
    },
    '& h2': {
      ...theme.typography.display1,
      ...theme.typography.postStyle,
    },
    '& h3': {
      ...theme.typography.display1,
      ...theme.typography.postStyle,
    },
    '& h4': {
      ...theme.typography.body1,
      ...theme.typography.postStyle,
      fontWeight:600,
    },
    '& img': {
      maxWidth: "100%"
    },
    '& a, & a:hover, & a:active': {
      ...linkStyle({
        theme: theme,
        underlinePosition: (
          (theme.typography.postStyle && theme.typography.postStyle.linkUnderlinePosition) ||
          "97%"
        ),
        background: (
          (theme.typography.body1 && theme.typography.body1.backgroundColor) ||
          (theme.typography.body1 && theme.typography.body1.background) ||
          "#fff"
        )
      })
    },
  }
}

export const commentBodyStyles = theme => {
  const commentBodyStyles = {
    marginTop: ".5em",
    marginBottom: ".25em",
    ...theme.typography.body2,
    ...theme.typography.commentStyle,
    ...spoilerStyles(theme),
    '& blockquote': {
      ...theme.typography.commentBlockquote,
      ...theme.typography.body2,
      ...theme.typography.commentStyle
    },
    '& li': {
      ...theme.typography.body2,
      ...theme.typography.commentStyle
    },
    '& h1, & h2, & h3': {
      ...theme.typography.commentHeader,
      ...theme.typography.commentStyle
    },
    // spoiler styles
    // HACK FIXME: Playing with pointer events is a horrible idea in general, and probably also in this context
    // but it's the only way I was able to make this weird stuff work.
    pointerEvents: 'none',
    '& *': {
      pointerEvents: 'auto'
    },
    '& > *:hover ~ .spoiler': {
      color: 'black'
    },
    '& > *:hover ~ .spoiler:before': {
      content: '"spoiler (hover/select to reveal)"',
      color: 'white',
    },
    '& a, & a:hover, & a:active': {
      backgroundImage: "none",
      textShadow: "none",
      textDecoration: "none",
    },
    '& pre code a, & pre code a:hover, & pre code a:active': {
      backgroundImage: "none",
      textShadow: "none",
      textDecoration: "none",
    }
  }
  return deepmerge(postBodyStyles(theme), commentBodyStyles, {isMergeableObject:isPlainObject})
}

export const postHighlightStyles = theme => {
  const postHighlightStyles = {
    ...theme.typography.body2,
    ...theme.typography.postStyle,
    '& blockquote': {
      ...theme.typography.body2,
      ...theme.typography.postStyle,
      '& > p': {
        margin:0
      },
    },
    '& li': {
      ...theme.typography.body2,
      ...theme.typography.postStyle,
    },
    '& h1, & h2, & h3': {
      ...theme.typography.commentHeader,
    },
  }
  return deepmerge(postBodyStyles(theme), postHighlightStyles, {isMergeableObject:isPlainObject})
}

export const editorStyles = (theme, styleFunction) => ({
    '& .public-DraftStyleDefault-block': {
      marginTop: '1em',
      marginBottom: '1em',
    },
    '& code .public-DraftStyleDefault-block': {
      marginTop: 0,
      marginBottom: 0,
    },
    '& blockquote .public-DraftStyleDefault-block': {
      marginTop: 0,
      marginBottom: 0,
    },
    ...styleFunction(theme)
})
