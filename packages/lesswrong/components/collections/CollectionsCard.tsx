import { Components, registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import { Link } from '../../lib/reactRouterWrapper';
import classNames from 'classnames';
import type { CoreReadingCollection } from '../sequences/CoreReading';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    width: "100%",
    maxWidth: 347,
    marginRight: 12,
    background: "white",
    marginBottom: 12,
    "&:hover": {
      boxShadow: "0 0 3px rgba(0,0,0,.1)"
    },
  },
  card: {
    padding: theme.spacing.unit*2.5,
    display: "flex",
    height: 315,
    [theme.breakpoints.down('sm')]: {
      height: "auto",
    },
    [theme.breakpoints.down('xs')]: {
      height: "auto",
      padding: theme.spacing.unit*1.25,
    },
    flexWrap: "wrap",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  content: {
    borderTop: "solid 4px black",
    paddingTop: theme.spacing.unit*1.5
  },
  mergeTitle: {
    display: "inline",
    marginRight: 10,
  },
  text: {
    ...theme.typography.postStyle,
  },
  author: {
    ...theme.typography.postStyle,
    marginBottom:theme.spacing.unit,
    display: "inline-block",
  },
  media: {
    '& img':{
      width:307,
      [theme.breakpoints.down('sm')]: {
        width: "100%",
        maxWidth:307,
        overflow: "hidden"
      },
    },
    
    [theme.breakpoints.down('xs')]: {
      display: "none",
    },
  },
  thumbnailImage: { // Used only on XS screens
    float: "left",
    position: "relative",
    marginRight: 15,

    '& img': {
      width: 50,
      height: 41,
    },
    
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
})

const CollectionsCard = ({ collection, url, mergeTitle=false, classes }: {
  collection: CoreReadingCollection,
  url: string,
  mergeTitle?: boolean,
  classes: ClassesType,
}) => {
  const { LinkCard, CloudinaryImage, UsersName, Typography } = Components;
  const cardContentStyle = {borderTopColor: collection.color}

  return <LinkCard className={classes.root} to={url}>
    <div className={classes.card}>
      <div className={classes.content} style={cardContentStyle}>
        <div className={classes.thumbnailImage}>
          <CloudinaryImage
            publicId={collection.imageId}
            width={50}
            height={41}
          />
        </div>
        <Typography variant="title" className={classNames(classes.title, {[classes.mergeTitle]: mergeTitle})}>
          <Link to={url}>{collection.title}</Link>
        </Typography>
        <Typography variant="subheading" className={classes.author}>
          by <UsersName documentId={collection.userId}/>
        </Typography>
        <Typography variant="body2" className={classes.text}>
          {collection.summary}
        </Typography>
      </div>
      <div className={classes.media}>
        <CloudinaryImage publicId={collection.imageId} />
      </div>
    </div>
  </LinkCard>
}

const CollectionsCardComponent = registerComponent(
  "CollectionsCard", CollectionsCard, { styles }
);

declare global {
  interface ComponentTypes {
    CollectionsCard: typeof CollectionsCardComponent
  }
}
