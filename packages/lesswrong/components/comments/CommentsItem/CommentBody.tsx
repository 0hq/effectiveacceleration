import { Components, registerComponent } from '../../../lib/vulcan-lib';
import React from 'react';
import { commentBodyStyles, answerStyles } from '../../../themes/stylePiping'
import classNames from 'classnames';
import { commentExcerptFromHTML } from '../../../lib/editor/ellipsize'
import { useCurrentUser } from '../../common/withUser'

const styles = (theme: ThemeType): JssStyles => ({
  commentStyling: {
    ...commentBodyStyles(theme),
    maxWidth: "100%",
    overflowX: "hidden",
    overflowY: "hidden",
  },
  answerStyling: {
    ...answerStyles(theme),
    maxWidth: "100%",
    overflowX: "hidden",
    overflowY: "hidden",
    '& .read-more a, & .read-more a:hover': {
      textShadow:"none",
      backgroundImage: "none"
    },
    marginBottom: ".5em"
  },
  root: {
    position: "relative",
    '& .read-more': {
      fontSize: ".85em",
      color: theme.palette.grey[600]
    }
  },
  retracted: {
    textDecoration: "line-through",
  }
})

const CommentBody = ({ comment, classes, collapsed, truncated, postPage }: {
  comment: CommentsList,
  collapsed?: boolean,
  truncated?: boolean,
  postPage?: boolean,
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const { ContentItemBody, CommentDeletedMetadata } = Components
  const { html = "" } = comment.contents || {}

  const bodyClasses = classNames(
    { [classes.commentStyling]: !comment.answer,
      [classes.answerStyling]: comment.answer,
      [classes.retracted]: comment.retracted }
  );

  if (comment.deleted) { return <CommentDeletedMetadata documentId={comment._id}/> }
  if (collapsed) { return null }

  const innerHtml = truncated ? commentExcerptFromHTML(comment, currentUser, postPage) : html

  return (
    <div className={classes.root}>
      <ContentItemBody
        className={bodyClasses}
        dangerouslySetInnerHTML={{__html: innerHtml }}
        description={`comment ${comment._id}`}
      />
    </div>
  )
}

const CommentBodyComponent = registerComponent('CommentBody', CommentBody, {styles});

declare global {
  interface ComponentTypes {
    CommentBody: typeof CommentBodyComponent,
  }
}

