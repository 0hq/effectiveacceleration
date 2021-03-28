import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { useSingle } from '../../lib/crud/withSingle';
import { useHover } from '../common/withHover';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    display: "block",
    padding: 8,
    cursor: "pointer",
    ...theme.typography.commentStyle,
    color: theme.palette.grey[900],
    '&:hover': {
      color: theme.palette.lwTertiary.main
    }
  },
  card: {
    // No hover-preview on small phone screens
    [theme.breakpoints.down('xs')]: {
      display: "none",
    },
  },
  tagDescription: {
    marginBottom: 12
  },
  postCount: {
    fontSize: ".85em",
    color: theme.palette.grey[500]
  }
});

const TagSearchHit = ({hit, onClick, classes}: {
  hit: any,
  onClick: (ev: any) => void,
  classes: ClassesType,
}) => {
  const { PopperCard, TagPreview, Loading } = Components;
  const { document: tag } = useSingle({
    documentId: hit._id,
    collectionName: "Tags",
    fragmentName: "TagPreviewFragment",
    fetchPolicy: 'cache-then-network' as any, //TODO
  });
  const {eventHandlers, hover, anchorEl} = useHover();

  return (
    <span {...eventHandlers}>
      <PopperCard open={hover} anchorEl={anchorEl} placement="right-start">
        <div className={classes.card}>
          {!tag && <Loading/>}
          {tag && <TagPreview tag={tag} postCount={3}/>}
        </div>
      </PopperCard>
      <span className={classes.root} onClick={onClick} >
        {hit.name} <span className={classes.postCount}>({hit.postCount || 0})</span>
      </span>
    </span>
  );
}

const TagSearchHitComponent = registerComponent("TagSearchHit", TagSearchHit, {styles});

declare global {
  interface ComponentTypes {
    TagSearchHit: typeof TagSearchHitComponent
  }
}

