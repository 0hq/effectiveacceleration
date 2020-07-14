import React from 'react';
import { registerComponent } from '../../lib/vulcan-lib'
import { InstantSearch, Configure } from 'react-instantsearch-dom';
import { isAlgoliaEnabled, getSearchClient } from '../../lib/algoliaUtil';
import { connectAutoComplete } from 'react-instantsearch/connectors';
import Autosuggest from 'react-autosuggest';

const styles = theme => ({
  autoComplete: {
    '& input': {
      ...theme.typography.body2,
      ...theme.typography.uiStyle,
      backgroundColor: "rgba(0,0,0,0)"
    },
    "& li": {
      listStyle: "none",
    },
    "& .react-autosuggest__suggestion--highlighted": {
        backgroundColor: "rgba(0,0,0,0.05)",
    },
    "& ul": {
      marginLeft: 0,
      paddingLeft: 0,
    },
  }
});

const SearchAutoComplete = ({ clickAction, placeholder, noSearchPlaceholder, renderSuggestion, hitsPerPage=7, indexName, classes, renderInputComponent }: {
  clickAction: any,
  placeholder: string,
  noSearchPlaceholder: string,
  renderSuggestion: any,
  hitsPerPage?: number,
  indexName: string,
  classes: ClassesType,
  renderInputComponent?: any,
}) => {
  if (!isAlgoliaEnabled) {
    // Fallback for when Algolia is unavailable (ie, local development installs).
    // This isn't a particularly nice UI, but it's functional enough to be able
    // to test other things.
    return <input type="text" placeholder={noSearchPlaceholder} onKeyPress={ev => {
      if (ev.charCode===13) {
        const id = (ev.target as HTMLInputElement).value;
        clickAction(id);
        ev.preventDefault();
      }
    }}/>;
  }
  
  const onSuggestionSelected = (event, { suggestion }) => {
    event.preventDefault();
    event.stopPropagation();
    clickAction(suggestion._id)
  }
  return <InstantSearch
    indexName={indexName}
    searchClient={getSearchClient()}
  >
    <div className={classes.autoComplete}>
      <AutocompleteTextbox onSuggestionSelected={onSuggestionSelected} placeholder={placeholder} renderSuggestion={renderSuggestion} renderInputComponent={renderInputComponent}/>
      <Configure hitsPerPage={hitsPerPage} />
    </div>
  </InstantSearch>
}

const AutocompleteTextbox = connectAutoComplete(
  ({
    // From connectAutoComplete HoC
    hits, currentRefinement, refine,
    // FromSearchAutoComplete
    onSuggestionSelected, placeholder, renderSuggestion, renderInputComponent
  }) => {
    return (
      <Autosuggest
        suggestions={hits}
        onSuggestionSelected={onSuggestionSelected}
        onSuggestionsFetchRequested={({ value }) => refine(value)}
        onSuggestionsClearRequested={() => refine('')}
        getSuggestionValue={hit => hit.title}
        renderInputComponent={renderInputComponent}
        renderSuggestion={renderSuggestion}
        inputProps={{
          placeholder: placeholder,
          value: currentRefinement,
          onChange: () => {},
        }}
        highlightFirstSuggestion
      />
    );
  }
);

const SearchAutoCompleteComponent = registerComponent("SearchAutoComplete", SearchAutoComplete, {styles});

declare global {
  interface ComponentTypes {
    SearchAutoComplete: typeof SearchAutoCompleteComponent
  }
}

