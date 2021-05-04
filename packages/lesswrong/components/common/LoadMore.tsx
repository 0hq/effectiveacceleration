import { registerComponent, Components } from '../../lib/vulcan-lib';
import React from 'react';
import classNames from 'classnames';
import { queryIsUpdating } from './queryStatusUtils'
import {useTracking} from "../../lib/analyticsEvents";

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    ...theme.typography.body2,
    ...theme.typography.commentStyle,
    color: theme.palette.lwTertiary.main,
    display: "inline-block",
    minHeight: 20,
  },
  loading: {
    minHeight: 20,
  },
  disabled: {
    color: theme.palette.grey[400],
    cursor: 'default',
    '&:hover': {
      opacity: 1
    }
  }
})


// Load More button. The simplest way to use this is to take `loadMoreProps`
// from the return value of `useMulti` and spread it into this component's
// props.
const LoadMore = ({ loadMore, count, totalCount, className=null, disabled=false, networkStatus, loading=false, hideLoading=false, hidden=false, classes }: {
  // loadMore: Callback when clicked.
  loadMore: any,
  // count/totalCount: If provided, looks like "Load More (10/25)"
  count?: number,
  totalCount?: number,
  // className: If provided, replaces the root style (default typography).
  className?: string|null|undefined,
  // disabled: If true, this is grayed out (eg because everything's already loaded).
  disabled?: boolean,
  networkStatus?: any,
  loading?: boolean,
  // hideLoading: Reserve space for the load spinner as normal, but don't show it
  hideLoading?: boolean,
  hidden?: boolean,
  classes: ClassesType,
}) => {
  const { captureEvent } = useTracking()

  const { Loading } = Components
  const handleClickLoadMore = event => {
    event.preventDefault();
    loadMore();
    captureEvent("loadMoreClicked")
  }

  if (loading || (networkStatus && queryIsUpdating(networkStatus))) {
    return <div className={classes.loading}>
      {!hideLoading && <Loading/>}
    </div>
  }

  if (hidden) return null;
  
  return (
    <a
      className={classNames(className ? className : classes.root, {[classes.disabled]: disabled})}
      href="#"
      onClick={handleClickLoadMore}
    >
      {totalCount ? `Load More (${count}/${totalCount})` : "Load More"}
    </a>
  )
}

const LoadMoreComponent = registerComponent('LoadMore', LoadMore, {styles});

declare global {
  interface ComponentTypes {
    LoadMore: typeof LoadMoreComponent
  }
}
