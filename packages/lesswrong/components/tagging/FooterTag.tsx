import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { Link } from '../../lib/reactRouterWrapper';
import withHover from '../common/withHover';

export const tagStyle = theme => ({
  marginRight: 4,
  padding: 5,
  paddingLeft: 8,
  paddingRight: 7,
  backgroundColor: 'rgba(0,0,0,0.05)',
  borderRadius: 10,
  ...theme.typography.commentStyle,
  "&:hover": {
    opacity: 1
  }
})

const styles = theme => ({
  root: {
    ...tagStyle(theme)
  },
  score: {
    color: 'rgba(0,0,0,0.7)',
  },
  name: {
    display: 'inline-block',
    paddingRight: 5
  },
  hovercard: {
  },
});

interface ExternalProps {
  tagRel: TagRelFragment,
  tag: TagRelFragment_tag,
}
interface FooterTagProps extends ExternalProps, WithHoverProps, WithStylesProps {
}

const FooterTag = ({tagRel, tag, hideScore=false, hover, anchorEl, classes}: {
  tagRel: TagRelFragment,
  tag: TagRelFragment_tag,
  hideScore?: boolean,
  
  hover: boolean,
  anchorEl: any,
  classes: ClassesType,
}) => {
  return (<span className={classes.root}>
    <Link to={`/tag/${tag.slug}`}>
      <span className={classes.name}>{tag.name}</span>
      {!hideScore && <span className={classes.score}>{tagRel.baseScore}</span>}
    </Link>
    <Components.PopperCard open={hover} anchorEl={anchorEl}>
      <div className={classes.hovercard}>
        <Components.TagRelCard tagRel={tagRel}/>
      </div>
    </Components.PopperCard>
  </span>);
}

const FooterTagComponent = registerComponent<ExternalProps>("FooterTag", FooterTag, {
  styles,
  hocs: [withHover()]
});

declare global {
  interface ComponentTypes {
    FooterTag: typeof FooterTagComponent
  }
}
