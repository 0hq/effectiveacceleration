import React, {useState} from 'react';
import TagHistory from '@material-ui/icons/History';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import type { ChangeMetrics } from '../../lib/collections/revisions/collection';
import { tagGetUrl, tagGetDiscussionUrl } from '../../lib/collections/tags/helpers';
import { Link } from '../../lib/reactRouterWrapper';
import { ExpandedDate } from '../common/FormatDate';
import moment from 'moment';

export const POSTED_AT_WIDTH = 38

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    background: "white",
    border: `solid 1px ${theme.palette.commentBorderGrey}`,
    borderRadius: 3,
    marginBottom: 4,
  },
  metadata: {
    display: "flex",
    alignItems: "center",
    paddingRight: 8,
    paddingLeft: 8,
    cursor: "pointer",
  },
  title: {
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    cursor: "pointer",
    padding: 4,
    
    fontFamily: theme.typography.fontFamily,
    fontSize: 17,
    fontVariant: "small-caps",
  },
  expandedBody: {
    marginTop: 8,
  },
  subheading: {
    fontSize: "1.17rem",
    fontFamily: theme.typography.fontFamily,
    color: "#424242",
    display: "inline-block",
    marginLeft: 8,
    marginBottom: 8,
  },
  commentBubble: {
    marginLeft: 11,
    marginTop: -5,
  },
  changeMetrics: {
    cursor: "pointer",
  },
  postedAt: {
    '&&': {
      cursor: "pointer",
      width: POSTED_AT_WIDTH,
      fontWeight: 300,
      fontSize: "1rem",
      color: "rgba(0,0,0,.9)",
      [theme.breakpoints.down('xs')]: {
        width: "auto",
      }
    }
  },
  icon: {
    height: "1.5rem",
    position: "relative",
    top: 3,
    marginLeft: 8,
  },
});

const SingleLineTagUpdates = ({tag, revisionIds, commentCount, commentIds, changeMetrics, lastRevisedAt, classes}: {
  tag: TagBasicInfo,
  revisionIds: string[],
  commentCount?: number,
  commentIds?: string[],
  changeMetrics: ChangeMetrics,
  classes: ClassesType,
  lastRevisedAt?: Date
}) => {
  const [expanded,setExpanded] = useState(false);
  const { ChangeMetricsDisplay, PostsItemComments, AllPostsPageTagRevisionItem, CommentById, LWTooltip, PostsItem2MetaInfo } = Components;
  
  return <div className={classes.root} >
    <div className={classes.metadata} onClick={ev => setExpanded(!expanded)}>

      <div className={classes.title} >
        <Link to={tagGetUrl(tag)}>{tag.name}</Link>
        
        {revisionIds.length>0 && <Link to={`/revisions/tag/${tag.slug}`}>
          <TagHistory className={classes.icon}  />
        </Link>}
      </div>

      {/* Show lastRevised date with tooltip*/}
      {lastRevisedAt
        ? <LWTooltip placement="right" title={<ExpandedDate date={lastRevisedAt}/>} >
            <PostsItem2MetaInfo className={classes.postedAt}> {moment(new Date(lastRevisedAt)).fromNow()} </PostsItem2MetaInfo>
          </LWTooltip>
        : null
      }

      {(changeMetrics.added>0 || changeMetrics.removed>0) && <div className={classes.changeMetrics}>
        <ChangeMetricsDisplay changeMetrics={changeMetrics}/>
      </div>}
      {!!commentCount && commentCount>0 && <Link to={tagGetDiscussionUrl(tag)} className={classes.commentBubble}>
        <PostsItemComments
          small={true}
          commentCount={commentCount}
          unreadComments={false}
          newPromotedComments={false}
        />
      </Link>}
    </div>
    
    {expanded && <div className={classes.expandedBody}>
      {/* Only show this subtitle if there are both edits and comments */}
      {commentIds && commentIds.length>0 && revisionIds.length>0 && <Link to={`/revisions/tag/${tag.slug}`} className={classes.subheading}>
        Edits
      </Link>}
      {revisionIds.map(revId => <div className={classes.tagRevision} key={revId}>
        <AllPostsPageTagRevisionItem
          tag={tag}
          documentId={tag._id}
          revisionId={revId}
        />
      </div>)}
      
      {commentIds && commentIds.length>0 && <Link to={tagGetDiscussionUrl(tag)} className={classes.subheading}>
        Comment Threads
      </Link>}
      {commentIds && commentIds.map(commentId =>
        <CommentById
          key={commentId}
          commentId={commentId}
          nestingLevel={2}
          isChild={true}
          treeOptions={{
            tag,
          }}
        />
      )}
    </div>}
  </div>
}

const SingleLineTagUpdatesComponent = registerComponent('SingleLineTagUpdates', SingleLineTagUpdates, {styles});

declare global {
  interface ComponentTypes {
    SingleLineTagUpdates: typeof SingleLineTagUpdatesComponent
  }
}
