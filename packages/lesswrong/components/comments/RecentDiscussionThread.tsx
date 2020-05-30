import React, { useState, useCallback } from 'react';
import {
  Components,
  registerComponent,
} from '../../lib/vulcan-lib';

import classNames from 'classnames';
import { unflattenComments, CommentTreeNode } from '../../lib/utils/unflatten';
import withErrorBoundary from '../common/withErrorBoundary'
import withRecordPostView from '../common/withRecordPostView';

import { postExcerptFromHTML } from '../../lib/editor/ellipsize'
import { postHighlightStyles } from '../../themes/stylePiping'

const styles = theme => ({
  root: {
    marginTop: 8,
    marginBottom: theme.spacing.unit*4,
    position: "relative",
    minHeight: 50,
    boxShadow: "0 0 2px rgba(0,0,0,.2)",
    borderRadius: 3,
    background: "white",
  },
  postStyle: theme.typography.postStyle,
  postBody: {
    ...postHighlightStyles(theme),
    marginBottom:theme.spacing.unit*2,
    maxWidth: "100%",
    overflowX: "auto",
    overflowY: "hidden",
  },
  postItem: {
    // position: "absolute",
    // right: "100%",
    paddingBottom:10,
    ...theme.typography.postStyle,
    // width: 300,
    // marginTop: -2,
    // textAlign: "right",
    // marginRight: -theme.spacing.unit
  },
  continueReading: {
    marginTop:theme.spacing.unit*2,
    marginBottom:theme.spacing.unit*2,
  },
  postHighlight: {
    ...postHighlightStyles(theme),
    marginTop:12,
    maxWidth:600,
    maxHeight: 1000,
    marginBottom: 16,
    overflow: "hidden",
    '& a, & a:hover, & a:focus, & a:active, & a:visited': {
      backgroundColor: "none"
    }
  },
  noComments: {
    // borderBottom: "solid 1px rgba(0,0,0,.2)"
  },
  threadMeta: {
    cursor: "pointer",

    "&:hover $showHighlight": {
      opacity: 1
    },
  },
  showHighlight: {
    opacity: 0,
  },
  content :{
    backgroundColor: "rgba(0,0,0,.025)",
    padding: 12,
    paddingBottom: 8
  },
  commentsList: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      marginRight: 0
    }
  },
  post: {
    paddingTop: 18,
    paddingLeft: 12,
    paddingRight: 12,
  },
  title: {
    ...theme.typography.display2,
    ...theme.typography.postStyle,
    marginTop: 0,
    marginBottom: 12,
    fontSize: "1.75rem",
  }
})

interface ExternalProps {
  post: PostsRecentDiscussion,
  comments: Array<CommentsList>,
  refetch: any,
  expandAllThreads?: boolean,
}
interface RecentDiscussionThreadProps extends ExternalProps, WithUpdateCommentProps, WithStylesProps {
  isRead: any,
  recordPostView: any,
}
const RecentDiscussionThread = ({
  post, recordPostView,
  comments, updateComment, classes, isRead, refetch,
  expandAllThreads: initialExpandAllThreads,
}: RecentDiscussionThreadProps) => {
  const [highlightVisible, setHighlightVisible] = useState(false);
  const [readStatus, setReadStatus] = useState(false);
  const [markedAsVisitedAt, setMarkedAsVisitedAt] = useState<Date|null>(null);
  const [expandAllThreads, setExpandAllThreads] = useState(false);
  const [showSnippet] = useState(!isRead || post.commentCount === null); // This state should never change after mount, so we don't grab the setter from useState
  
  const markAsRead = useCallback(
    () => {
      setReadStatus(true);
      setMarkedAsVisitedAt(new Date());
      setExpandAllThreads(true);
      recordPostView({post, extraEventProperties: {type: "recentDiscussionClick"}})
    },
    [setReadStatus, setMarkedAsVisitedAt, setExpandAllThreads, recordPostView, post]
  );
  const showHighlight = useCallback(
    () => {
      setHighlightVisible(!highlightVisible);
      markAsRead();
    },
    [setHighlightVisible, highlightVisible, markAsRead]
  );
  
  const { ContentItemBody, PostsItemMeta, ShowOrHideHighlightButton, CommentsNode, PostsHighlight } = Components

  const lastCommentId = comments && comments[0]?._id
  const nestedComments = unflattenComments(comments);

  const lastVisitedAt = markedAsVisitedAt || post.lastVisitedAt

  if (comments && !comments.length && post.commentCount != null) {
    // New posts should render (to display their highlight).
    // Posts with at least one comment should only render if that those comments meet the frontpage filter requirements
    return null
  }

  const highlightClasses = classNames({
    [classes.noComments]: post.commentCount === null
  })
  return (
    <div className={classes.root}>
      <div className={classes.post}>
        <div className={classes.postItem}>
          <div className={classes.title}>
            {post.title}
          </div>
          <div className={classes.threadMeta} onClick={showHighlight}>
            <PostsItemMeta post={post}/>
            <ShowOrHideHighlightButton
              className={classes.showHighlight}
              open={highlightVisible}/>
          </div>
        </div>
        { post.contents?.htmlHighlight && highlightVisible ?
          <div className={highlightClasses}>
            <PostsHighlight post={post} />
          </div>
          : <div className={highlightClasses} onClick={showHighlight}>
              { showSnippet &&
                <ContentItemBody
                  className={classes.postHighlight}
                  dangerouslySetInnerHTML={{__html: postExcerptFromHTML(post.contents.htmlHighlight)}}
                  description={`post ${post._id}`}
                />
              }
            </div>
        }
      </div>
      <div className={classes.content}>
        <div className={classes.commentsList}>
          {nestedComments.map((comment: CommentTreeNode<CommentsList>) =>
            <div key={comment.item._id}>
              <CommentsNode
                startThreadTruncated={true}
                expandAllThreads={initialExpandAllThreads || expandAllThreads}
                scrollOnExpand
                nestingLevel={1}
                lastCommentId={lastCommentId}
                comment={comment.item}
                markAsRead={markAsRead}
                highlightDate={lastVisitedAt}
                //eslint-disable-next-line react/no-children-prop
                children={comment.children}
                key={comment.item._id}
                post={post}
                refetch={refetch}
                condensed
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

const RecentDiscussionThreadComponent = registerComponent<ExternalProps>(
  'RecentDiscussionThread', RecentDiscussionThread, {
    styles,
    hocs: [
      withRecordPostView,
      withErrorBoundary
    ]
  }
);

declare global {
  interface ComponentTypes {
    RecentDiscussionThread: typeof RecentDiscussionThreadComponent,
  }
}

