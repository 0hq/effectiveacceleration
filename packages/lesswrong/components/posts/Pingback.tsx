import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { useHover } from '../common/withHover';
import { KARMA_WIDTH } from './PostsItem2';

const styles = theme => ({
  root: {
    display: "flex",
    marginBottom: 2,
  },
  karma: {
    width: KARMA_WIDTH
  }
});

const Pingback = ({classes, post}: {
  classes: ClassesType,
  post: PostsList,
}) => {
  const { LWPopper, PostsItem2MetaInfo, PostsItemKarma, PostsTitle, PostsPreviewTooltip } = Components
  const {eventHandlers, hover, anchorEl } = useHover();

  return <span {...eventHandlers}>
    <div className={classes.root}>
      <LWPopper 
        open={hover} 
        anchorEl={anchorEl} 
        placement="bottom-end"
        modifiers={{
          flip: {
            behavior: ["bottom-end", "top", "bottom-end"],
            boundariesElement: 'viewport'
          } 
        }}
      >
        <PostsPreviewTooltip post={post}/>
      </LWPopper>
      <PostsItem2MetaInfo className={classes.karma}>
        <PostsItemKarma post={post} />
      </PostsItem2MetaInfo>
      <PostsTitle post={post} read={!!post.lastVisitedAt} showIcons={false} wrap/>
    </div>
  </span>
}

const PingbackComponent = registerComponent("Pingback", Pingback, {styles});

declare global {
  interface ComponentTypes {
    Pingback: typeof PingbackComponent
  }
}

