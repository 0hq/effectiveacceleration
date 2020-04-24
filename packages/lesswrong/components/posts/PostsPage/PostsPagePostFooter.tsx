import React from 'react';
import { Components, registerComponent } from '../../../lib/vulcan-lib';
import { userHasPingbacks } from '../../../lib/betas';
import { AnalyticsContext } from "../../../lib/analyticsEvents";
import { useCurrentUser } from '../../common/withUser';
import { Posts } from '../../../lib/collections/posts';
import { MAX_COLUMN_WIDTH } from './PostsPage';

const HIDE_POST_BOTTOM_VOTE_WORDCOUNT_LIMIT = 300

const styles = theme => ({
  footerSection: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.4em'
  },
  voteBottom: {
    position: 'relative',
    fontSize: 42,
    textAlign: 'center',
    display: 'inline-block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 40
  },
  bottomNavigation: {
    width: 640,
    margin: 'auto',
    [theme.breakpoints.down('sm')]: {
      width:'100%',
      maxWidth: MAX_COLUMN_WIDTH
    }
  },
});

const PostsPagePostFooter = ({post, sequenceId, classes}: {
  post: PostsWithNavigation|PostsWithNavigationAndRevision,
  sequenceId: string,
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const { PostsVote, BottomNavigation, PingbacksList, FooterTagList } = Components;
  const wordCount = post.contents?.wordCount || 0
  
  return <>
    <AnalyticsContext pageSectionContext="tagFooter">
      <FooterTagList post={post}/>
    </AnalyticsContext>
    {(wordCount > HIDE_POST_BOTTOM_VOTE_WORDCOUNT_LIMIT) &&
      <div className={classes.footerSection}>
        <div className={classes.voteBottom}>
          <PostsVote
            collection={Posts}
            post={post}
            />
        </div>
      </div>}
    {sequenceId && <div className={classes.bottomNavigation}>
      <AnalyticsContext pageSectionContext="bottomSequenceNavigation">
        <BottomNavigation post={post}/>
      </AnalyticsContext>
    </div>}

    {userHasPingbacks(currentUser) && <AnalyticsContext pageSectionContext="pingbacks">
      <PingbacksList postId={post._id}/>
    </AnalyticsContext>}
  </>
}

const PostsPagePostFooterComponent = registerComponent("PostsPagePostFooter", PostsPagePostFooter, {styles});

declare global {
  interface ComponentTypes {
    PostsPagePostFooter: typeof PostsPagePostFooterComponent
  }
}
