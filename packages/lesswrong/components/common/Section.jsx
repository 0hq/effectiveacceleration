import { Components, registerComponent } from 'meteor/vulcan:core';
import { Link } from 'react-router';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';


const BORDER_TOP_WIDTH = 3

const styles = (theme) => ({
  section: {
    marginBottom: theme.spacing.unit * 4,
    [theme.breakpoints.only('md')]: {
      marginLeft: 15
    },
    [theme.breakpoints.up('lg')]: {
      marginLeft: 50
    },
  },
  sectionTitleContainer: {
    [theme.breakpoints.up('md')]: {
      textAlign: 'right',
      display: 'inline',
      maxWidth: 240,
    },
  },
  sectionTitle: {
    ...theme.typography.postStyle,
    [theme.breakpoints.down('sm')]: {
      borderTopWidth: BORDER_TOP_WIDTH,
      borderTopStyle: 'solid',
      paddingTop: theme.spacing.unit
    },
    [theme.breakpoints.up('md')]: {
      display: 'inline',
      position: 'relative',
      top: theme.spacing.unit + BORDER_TOP_WIDTH,
      '&:before': {
        top: (theme.spacing.unit - BORDER_TOP_WIDTH) * -1,
        position: 'absolute',
        width: '100%',
        borderTopStyle: 'solid',
        borderTopWidth: BORDER_TOP_WIDTH,
        content: '""'
      }
    }
  },
  sectionTitleTop: {
    [theme.breakpoints.up('md')]: {
      paddingBottom: theme.spacing.unit,
      marginBottom: theme.spacing.unit
    }
  },
  // left to provide overrides
  sectionTitleBottom: {},
  sectionContent: {
    maxWidth: 715
  },
  subscribeWidget: {
    marginBottom: -3 * theme.spacing.unit
  },
  [theme.breakpoints.down('md')]: {
    heading: {
      display: "inline"
    },
    subscribeWidget: {
      marginBottom: 0,
      display: "inline-block",
      marginLeft: 2 * theme.spacing.unit
    }
  }
})

const Section = ({
  contentStyle,
  title,
  titleLink,
  titleComponent,
  subscribeLinks = null,
  children,
  classes
}) => {

  return (
    <Components.ErrorBoundary>
      <Grid container className={classes.section} spacing={24}>
        <Grid item xs={12} md={3} className={classes.sectionTitleContainer}>
          {title && <div className={classes.sectionTitleTop}>
            <Typography variant="display2" className={classes.sectionTitle}>
              {!titleLink ? <span className="heading">{title}</span> : <Link className="heading" to={titleLink}>{title}</Link>}
              { subscribeLinks && <Typography className={classes.subscribeWidget} variant="body2">
                {subscribeLinks}
              </Typography> }
            </Typography>
          </div>}
          {titleComponent && <div className={classes.sectionTitleBottom}>
            {titleComponent}
          </div>}
        </Grid>
        <Grid item xs={12} md={9}>
          <div className={classes.sectionContent}>
            {children}
          </div>
        </Grid>
      </Grid>
    </Components.ErrorBoundary>
  )
};

registerComponent('Section', Section, withStyles(styles, { name: 'Section'}));
