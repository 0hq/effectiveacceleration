import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import classNames from 'classnames'

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    ...theme.typography.body2,
    ...theme.typography.commentStyle,
    fontSize: "1rem",
    color: theme.palette.lwTertiary.main,
    display: "inline-block",
    lineHeight: "1rem",
    marginBottom: 8
  }
})

const SectionSubtitle = ({children, classes, className}: {
  children?: React.ReactNode,
  classes: ClassesType,
  className?: string,
}) => {
  return <Components.Typography component='span' variant='subheading' className={classNames(classes.root, className)}>
    {children}
  </Components.Typography>
}

const SectionSubtitleComponent = registerComponent('SectionSubtitle', SectionSubtitle, {styles})

declare global {
  interface ComponentTypes {
    SectionSubtitle: typeof SectionSubtitleComponent
  }
}
