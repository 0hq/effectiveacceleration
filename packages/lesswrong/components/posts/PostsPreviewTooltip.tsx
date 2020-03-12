import { registerComponent, Components, getSetting } from '../../lib/vulcan-lib';
import React, { useState } from 'react';
import { truncate } from '../../lib/editor/ellipsize';
import { postHighlightStyles, commentBodyStyles } from '../../themes/stylePiping'
import { Posts } from '../../lib/collections/posts';
import Card from '@material-ui/core/Card';
import {AnalyticsContext} from "../../lib/analyticsEvents";
import { Link } from '../../lib/reactRouterWrapper';

export const POST_PREVIEW_WIDTH = 435

export const highlightStyles = theme => ({
  ...postHighlightStyles(theme),
  marginTop: theme.spacing.unit*2.5,
  marginBottom: theme.spacing.unit*1.5,
  marginRight: theme.spacing.unit/2,
  wordBreak: 'break-word',
  fontSize: "1.1rem",

  '& img': {
    display:"none"
  },
  '& h1': {
    fontSize: "1.2rem"
  },
  '& h2': {
    fontSize: "1.2rem"
  },
  '& h3': {
    fontSize: "1.1rem"
  },
  '& hr': {
    display: "none"
  }
})

const styles = theme => ({
  root: {
    width: POST_PREVIEW_WIDTH,
    position: "relative",
    padding: theme.spacing.unit*1.5,
    paddingBottom: 0,
    '& img': {
      maxHeight: "200px"
    },
    [theme.breakpoints.down('xs')]: {
      display: "none"
    },
    '& .expand': {
      color: theme.palette.grey[600],
      fontSize: "1rem",
      cursor: "pointer"
    }
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    marginBottom: -6,
  },
  tooltipInfo: {
    marginLeft: 2,
    fontStyle: "italic",
    ...commentBodyStyles(theme),
    fontSize: "1.1rem",
    color: theme.palette.grey[600],
    display: "flex",
    alignItems: "center"
  },
  highlight: {
    ...highlightStyles(theme)
  },
  comment: {
    marginTop: theme.spacing.unit,
    marginLeft: -13,
    marginRight: -13,
    marginBottom: -9
  },
  bookmark: {
    marginTop: -4,
    paddingRight: 4
  },
  continue: {
    ...postHighlightStyles(theme),
    color: theme.palette.grey[500],
    fontSize: "1rem",
    marginBottom: theme.spacing.unit,
  },
  wordCount: {
    marginLeft: theme.spacing.unit
  },
  metadata: {
    marginLeft: 12,
    paddingTop: 2
  },
  smallText: {
    fontSize: ".9rem",
    color: theme.palette.grey[500],
    marginRight: theme.spacing.unit
  },
  karmaIcon: {
    marginRight: -2,
    marginTop: 2,
    height: 15,
    color: "rgba(0,0,0,.19)"
  },
  commentIcon: {
    marginLeft: 6,
    marginTop: 2,
    // position: "relative",
    marginRight: -1,
    height: 13,
    color: "rgba(0,0,0,.19)"
  }
})

const metaName = getSetting('forumType') === 'EAForum' ? 'Community' : 'Meta'

const getPostCategory = (post: PostsBase) => {
  const categories: Array<string> = [];

  if (post.isEvent) categories.push(`Event`)
  if (post.curatedDate) categories.push(`Curated Post`)
  if (post.af) categories.push(`AI Alignment Forum Post`);
  if (post.meta) categories.push(`${metaName} Post`)
  if (post.frontpageDate && !post.curatedDate && !post.af) categories.push(`Frontpage Post`)

  if (categories.length > 0)
    return categories.join(', ');
  else
    return post.question ? `Question` : `Personal Blogpost`
}

const PostsPreviewTooltip = ({ postsList, post, classes, comment }: {
  postsList?: boolean,
  post: PostsList|null,
  classes: ClassesType,
  comment?: any,
}) => {
  const { PostsUserAndCoauthors, PostsTitle, ContentItemBody, CommentsNode, BookmarkButton, LWTooltip } = Components
  const [expanded, setExpanded] = useState(false)

  if (!post) return null

  const { wordCount = 0, htmlHighlight = "" } = post.contents || {}

  const highlight = post.customHighlight?.html || htmlHighlight

  const renderWordCount = !comment && (wordCount > 0)
  const truncatedHighlight = truncate(highlight, expanded ? 200 : 100, "words", `... <span class="expand">(more)</span>`)

  return <AnalyticsContext pageElementContext="hoverPreview">
      <Card className={classes.root}>
        <div className={classes.header}>
          <div>
            <div className={classes.title}>
              <PostsTitle post={post} wrap showIcons={false} />
            </div>
            <div className={classes.tooltipInfo}>
              { postsList && <span> 
                {getPostCategory(post)}
                {renderWordCount && <span className={classes.wordCount}>({wordCount} words)</span>}
              </span>}
              { !postsList && <>
                {post.user && <LWTooltip title="Author">
                  <PostsUserAndCoauthors post={post} simple/>
                </LWTooltip>}
                <div className={classes.metadata}>
                  <LWTooltip title={`${Posts.getKarma(post)} karma`}>
                    <span className={classes.smallText}>{Posts.getKarma(post)} karma</span>
                  </LWTooltip>
                  <LWTooltip title={`${Posts.getCommentCountStr(post)}`}>
                    <span className={classes.smallText}>{Posts.getCommentCountStr(post)}</span>
                  </LWTooltip>
                </div>
              </>}
            </div>
          </div>
          { !postsList && <div className={classes.bookmark}>
            <BookmarkButton post={post}/>
          </div>}
        </div>
        {comment
          ? <div className={classes.comment}>
              <CommentsNode
              truncated
              comment={comment}
              post={post}
              hoverPreview
              forceNotSingleLine
              hideReply
            /></div>
          : <div onClick={() => setExpanded(true)}>
              <ContentItemBody
                className={classes.highlight}
                dangerouslySetInnerHTML={{__html: truncatedHighlight }}
                description={`post ${post._id}`}
              />
              {expanded && <Link to={Posts.getPageUrl(post)}><div className={classes.continue} >
                (Continue Reading)
              </div></Link>}
            </div>
        }
    </Card>
  </AnalyticsContext>

}

const PostsPreviewTooltipComponent = registerComponent('PostsPreviewTooltip', PostsPreviewTooltip, {styles});

declare global {
  interface ComponentTypes {
    PostsPreviewTooltip: typeof PostsPreviewTooltipComponent
  }
}

