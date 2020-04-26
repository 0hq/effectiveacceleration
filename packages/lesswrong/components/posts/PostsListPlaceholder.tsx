import React from 'react';
import { registerComponent } from '../../lib/vulcan-lib';
import classNames from 'classnames';
import { styles } from './PostsItem2';

const PostsListPlaceholder = ({count, classes}: {
  count: number,
  classes: ClassesType
}) => {
  let placeholders: Array<JSX.Element> = [];
  for(let i=0; i<count; i++) {
    placeholders.push(
      <div key={i} className={classNames(
        classes.root,
        classes.background,
        {[classes.bottomBorder]: i !== count-1}
      )}>
        <div className={classes.postsItem}>
          <span className={classes.title}>
            <span className={classes.titlePlaceholder}>{" "}</span>
          </span>
        </div>
      </div>
    )
  }
  return <React.Fragment>{placeholders}</React.Fragment>;
}

const PostsListPlaceholderComponent = registerComponent("PostsListPlaceholder", PostsListPlaceholder, {styles});

declare global {
  interface ComponentTypes {
    PostsListPlaceholder: typeof PostsListPlaceholderComponent
  }
}
