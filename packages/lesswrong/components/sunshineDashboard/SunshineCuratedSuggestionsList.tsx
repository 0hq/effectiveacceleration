import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useMulti } from '../../lib/crud/withMulti';

const styles = (theme: ThemeType): JssStyles => ({
  loadMorePadding: {
    paddingLeft: 16,
  },
});

const SunshineCuratedSuggestionsList = ({ terms, belowFold, classes }:{
  terms: PostsViewTerms,
  belowFold?: boolean,
  classes: ClassesType,
}) => {
  const { results, loadMoreProps, showLoadMore } = useMulti({
    terms,
    collectionName: "Posts",
    fragmentName: 'PostsList',
    enableTotal: true,
    itemsPerPage: 60
  });

  const { results: curatedResults } = useMulti({
    terms: {view:'curated', limit:1},
    collectionName: "Posts",
    fragmentName: 'PostsList',
  });
  const curatedDate = new Date(curatedResults && curatedResults[0]?.curatedDate)
  const twoAndAHalfDaysAgo = new Date(new Date().getTime()-(2.5*24*60*60*1000));

  if (!belowFold && (curatedDate > twoAndAHalfDaysAgo)) return null
  
  const { SunshineListTitle, SunshineCuratedSuggestionsItem, MetaInfo, FormatDate, LoadMore } = Components
    
  if (results && results.length) {
    return (
      <div className={classes.root}>
        <SunshineListTitle>
          Suggestions for Curated
          <MetaInfo>
            <FormatDate date={curatedDate}/>
          </MetaInfo>
        </SunshineListTitle>
        {results.map(post =>
          <div key={post._id} >
            <SunshineCuratedSuggestionsItem post={post}/>
          </div>
        )}
        {showLoadMore && <div className={classes.loadMorePadding}>
          <LoadMore {...loadMoreProps}/>
        </div>}
      </div>
    )
  } else {
    return null
  }
}

const SunshineCuratedSuggestionsListComponent = registerComponent('SunshineCuratedSuggestionsList', SunshineCuratedSuggestionsList, {styles})

declare global {
  interface ComponentTypes {
    SunshineCuratedSuggestionsList: typeof SunshineCuratedSuggestionsListComponent
  }
}

