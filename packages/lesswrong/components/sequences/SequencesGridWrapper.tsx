import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useMulti } from '../../lib/crud/withMulti';
import React from 'react';
import classNames from 'classnames';

// Share styles with SequencesGrid
import { styles } from './SequencesGrid';

const SequencesGridWrapper = ({
  terms,
  className,
  classes,
  itemsPerPage=10,
  showLoadMore = false,
  showAuthor = false,
}: {
  terms: SequencesViewTerms,
  className?: string,
  classes: ClassesType,
  itemsPerPage?: number,
  showLoadMore?: boolean,
  showAuthor?: boolean,
}) => {
  const { results, loading, loadMoreProps } = useMulti({
    terms,
    itemsPerPage,
    collectionName: "Sequences",
    fragmentName: 'SequencesPageFragment',
    enableTotal: showLoadMore,
  });
  
  if (results && results.length) {
    return (<div className={classNames(className, classes.gridWrapper)}>
      <Components.SequencesGrid sequences={results} showAuthor={showAuthor} />
      {showLoadMore && <Components.LoadMore {...loadMoreProps} />}
    </div>);
  } else if (loading) {
    return (<div className={classNames(className, classes.grid)}>
      <Components.Loading/>
    </div>);
  } else {
    // TODO: Replace with SequencesNoResults
    return (<div className={classNames(className, classes.grid)}>
      <div className={classes.gridContent}>
        <Components.PostsNoResults/>
      </div>
    </div>);
  }
};

const SequencesGridWrapperComponent = registerComponent('SequencesGridWrapper', SequencesGridWrapper, {
  styles,
  areEqual: {
    terms: "deep"
  }
});

declare global {
  interface ComponentTypes {
    SequencesGridWrapper: typeof SequencesGridWrapperComponent
  }
}

