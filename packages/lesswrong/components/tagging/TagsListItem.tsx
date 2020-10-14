import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useHover } from '../common/withHover';
import { Link } from '../../lib/reactRouterWrapper';

const styles = (theme: ThemeType): JssStyles => ({
  tag: {
    ...theme.typography.body2,
    ...theme.typography.commentStyle,
    paddingTop: 3,
    paddingLeft: 6,
    paddingRight: 12,
    fontSize: "1.1rem",
    lineHeight: "1.1em",
    marginBottom: 8

  },
  count: {
    color: theme.palette.grey[500],
    fontSize: ".9em",
    position: "relative",
    marginLeft: 4,
    marginRight: 8
  },
  hideOnMobile: {
    [theme.breakpoints.down('xs')]: {
      display: "none"
    }
  }
});

const TagsListItem = ({tag, classes, postCount=3}: {
  tag: TagPreviewFragment,
  classes: ClassesType,
  postCount?: number,
}) => {
  const { PopperCard, TagPreview } = Components;
  const { hover, anchorEl, eventHandlers } = useHover();

  return <div {...eventHandlers} className={classes.tag}>
    <PopperCard 
      open={hover} 
      anchorEl={anchorEl} 
      placement="right-start"
    >
      <div className={classes.hideOnMobile}><TagPreview tag={tag} postCount={postCount}/></div>
    </PopperCard>
    <Link to={`/tag/${tag.slug}`}>
      {tag.name} { tag.needsReview }
    </Link>
    {tag.postCount && <span className={classes.count}>({tag.postCount})</span>} 
  </div>;
}

const TagsListItemComponent = registerComponent("TagsListItem", TagsListItem, {styles});

declare global {
  interface ComponentTypes {
    TagsListItem: typeof TagsListItemComponent
  }
}
