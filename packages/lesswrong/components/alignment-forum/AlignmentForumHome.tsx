import { Components, registerComponent } from '../../lib/vulcan-lib';
import React from 'react';
import { Link } from '../../lib/reactRouterWrapper';
import Users from "../../lib/collections/users/collection";
import { useCurrentUser } from '../common/withUser';
import { legacyBreakpoints } from '../../lib/utils/theme';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
  frontpageSequencesGridList: {
    [legacyBreakpoints.maxSmall]: {
      marginTop: 40,
    }
  }
});

const AlignmentForumHome = ({classes}: {
  classes: ClassesType
}) => {
  const { SingleColumnSection, SectionTitle, SequencesGridWrapper, PostsList2, SectionButton, RecentDiscussionThreadsList } = Components
  const currentUser = useCurrentUser();

  let recentPostsTerms = {view: 'new', limit: 10, forum: true, af: true}

  return (
    <div className="alignment-forum-home">
      <SingleColumnSection>
        <SectionTitle title="Recommended Sequences"/>
        <SequencesGridWrapper
            terms={{view:"curatedSequences", limit:3}}
            showAuthor={true}
            showLoadMore={false}
            className={classes.frontpageSequencesGridList}
          />
      </SingleColumnSection>
      <SingleColumnSection>
        <SectionTitle title="AI Alignment Posts">
          { currentUser && Users.canDo(currentUser, "posts.alignment.new") && 
            <Link to={{pathname:"/newPost", search: `?af=true`}}>
              <SectionButton>
                <AddIcon />
                New Post
              </SectionButton>
            </Link>
          }
        </SectionTitle>
        <PostsList2 terms={recentPostsTerms} />
      </SingleColumnSection>
      <SingleColumnSection>
        <RecentDiscussionThreadsList
          terms={{view: 'afRecentDiscussionThreadsList', limit:6}}
          maxAgeHours={24*7}
          af={true}
        />
      </SingleColumnSection>
    </div>
  )
};

const AlignmentForumHomeComponent = registerComponent(
  'AlignmentForumHome', AlignmentForumHome, {styles}
);

declare global {
  interface ComponentTypes {
    AlignmentForumHome: typeof AlignmentForumHomeComponent
  }
}
