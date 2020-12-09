import { Components, registerComponent } from '../../lib/vulcan-lib';
import React, { useState, useCallback } from 'react';
import { answerStyles } from '../../themes/stylePiping'
import withErrorBoundary from '../common/withErrorBoundary'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { AnalyticsContext } from "../../lib/analyticsEvents";
import classNames from 'classnames';
import { Comments } from "../../lib/collections/comments";
import { styles as commentsItemStyles } from "../comments/CommentsItem/CommentsItem";

const styles = (theme: ThemeType): JssStyles => ({
  postContent: {
    ...answerStyles(theme),
  },
  root: {
    marginBottom: theme.spacing.unit*4,
    paddingTop: theme.spacing.unit*2.5,
    paddingLeft: theme.spacing.unit*2.5,
    paddingRight: theme.spacing.unit*2.5,
    border: `solid 2px ${theme.palette.grey[300]}`,
    [theme.breakpoints.down('md')]: {
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  answer: {

  },
  answerHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing.unit*2
  },
  author: {
    display: 'inline-block',
    fontWeight: 600,
    ...theme.typography.postStyle
  },
  date: {
    display: 'inline-block',
    marginLeft: 10,
  },
  vote: {
    display: 'inline-block',
    marginLeft: 10,
    fontFamily: theme.typography.commentStyle.fontFamily,
    color: theme.palette.grey[500],
    flexGrow: 1,
    position: "relative",
    top: -4
  },
  footer: {
    marginTop: 5,
    marginLeft: -13,
    display:"flex",
    alignItems:"center",
  },
  separator: {
    borderColor: theme.palette.grey[200],
    width: "25%",
    marginTop: theme.spacing.unit*4,
    marginBottom: theme.spacing.unit*8
  },
  menu: {
    opacity:.5,
    cursor: "pointer",
    '&:hover': {
      opacity:1
    },
  },
  deletedSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    marginTop: 50
  },
  deleted: {
    color: theme.palette.grey[500]
  },
  footerVote: {
    fontSize: 42,
    textAlign: "center",
    marginRight: theme.spacing.unit
  },
  footerRight: {
    marginTop: theme.spacing.unit*2
  },
  newComment: {
    marginTop: theme.spacing.unit*2,
    color: theme.palette.grey[500]
  },
  metaData: {
    textAlign: 'right'
  },
  promoted: {
    border: `solid 2px ${theme.palette.lwTertiary.main}`,
  },
  metaNotice: {
    ...commentsItemStyles(theme).metaNotice,
    ...theme.typography.commentStyle,
    marginTop: -12,
    marginBottom: 10
  },
  retracted: {
    textDecoration: "line-through",
  },
})

const Answer = ({ comment, post, classes }: {
  comment: CommentsList,
  post: PostsList,
  classes: ClassesType,
}) => {
  const [showEdit,setShowEdit] = useState(false);
  const [commenting,setCommenting] = useState(false);
  
  const setShowEditTrue = useCallback(() => {
    setShowEdit(true)
  }, [setShowEdit]);
  const hideEdit = useCallback(() => {
    setShowEdit(false)
  }, [setShowEdit]);

  const { ContentItemBody, SmallSideVote, AnswerCommentsList, CommentsMenu, CommentsItemDate, UsersName, CommentBottomCaveats, Typography } = Components
  const { html = "" } = comment.contents || {}

  return (
    <div className={classNames(classes.root, {[classes.promoted]: comment.promoted})}>
      { comment.deleted ?
        <div className={classes.deletedSection} id={comment._id}>
          <Typography variant="body2" className={classes.deleted}>
            Answer was deleted
          </Typography>
          <span className={classes.menu}>
            <CommentsMenu
              showEdit={setShowEditTrue}
              comment={comment}
              post={post}
              icon={<MoreHorizIcon className={classes.menuIcon}/>}
            />
          </span>
        </div>
        :
        <div>
          <AnalyticsContext pageElementContext="answerItem">
            <div className={classes.answer} id={comment._id}>
              <div className={classes.answerHeader}>
                {comment.user && <Typography variant="body1" className={classes.author}>
                  { <UsersName user={comment.user} />}
                </Typography >}
                <Typography variant="subheading" className={classes.date}>
                  <CommentsItemDate comment={comment} post={post}/>
                </Typography>
                <span className={classes.vote}>
                  <SmallSideVote document={comment} collection={Comments}/>
                </span>
                <span className={classes.menu}>
                  <CommentsMenu
                    showEdit={setShowEditTrue}
                    comment={comment}
                    post={post}
                    icon={<MoreHorizIcon className={classes.menuIcon}/>}
                  />
                </span>
              </div>
              { comment.promotedByUser && <div className={classes.metaNotice}>
                Promoted by {comment.promotedByUser.displayName}
              </div>}
              { showEdit ?
                <Components.CommentsEditForm
                  comment={comment}
                  successCallback={hideEdit}
                  cancelCallback={hideEdit}
                />
                :
                <>
                  <ContentItemBody
                    className={classNames(classes.postContent,
                      {[classes.retracted]: comment.retracted})}
                    dangerouslySetInnerHTML={{__html:html}}
                    description={`comment ${comment._id} on post ${post._id}`}
                  />
                  <CommentBottomCaveats comment={comment}/>
                </>
              }
            </div>
          </AnalyticsContext>
          <AnswerCommentsList
            post={post}
            parentAnswer={comment}
          />
        </div>
      }
    </div>
  )
}

const AnswerComponent = registerComponent('Answer', Answer, {
  styles,
  hocs: [withErrorBoundary]
});

declare global {
  interface ComponentTypes {
    Answer: typeof AnswerComponent
  }
}

