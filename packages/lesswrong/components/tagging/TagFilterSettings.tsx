import React, { useState } from 'react';
import { registerComponent, Components, getSetting } from '../../lib/vulcan-lib';
import { FilterSettings, FilterTag, FilterMode } from '../../lib/filterSettings';
import { useMulti } from '../../lib/crud/withMulti';
import { Tags } from '../../lib/collections/tags/collection';
import * as _ from 'underscore';
import { useTracking } from "../../lib/analyticsEvents";

const styles = theme => ({
  root: {
    marginLeft: "auto",
    marginBottom: 6,
    ...theme.typography.commentStyle,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center"
  },
});

const lwafPersonalBlogpostInfo = {
  name: "Personal Blog",
  tooltip: <div>
    <p><b>Personal Blogposts</b> are posts that don't fit LessWrong's Frontpage Guidelines. They get less visibility by default. The frontpage guidelines are:</p>
    <ul>
      <li><em>Timelessness</em>. Will people still care about this in 5 years?</li>
      <li><em>Avoid political topics</em>. They're important to discuss sometimes, but we try to avoid it on LessWrong.</li>
      <li><em>General Appeal</em>. Is this a niche post that only a small fraction of users will care about?</li>
    </ul>
  </div>
}

const personalBlogpostInfo = {
  LessWrong: lwafPersonalBlogpostInfo,
  AlignmentForum: lwafPersonalBlogpostInfo,
  EAForum: {
    name: 'Community Posts',
    tooltip: <div>
      <div>
        By default, the home page only displays Frontpage Posts, which are selected by moderators as especially interesting or useful to people with interest in doing good effectively.
      </div>
      <div>
        Include community posts to get posts with topical content or which relate to the EA community itself.
      </div>
    </div>
  }
}

const personalBlogpostName = personalBlogpostInfo[getSetting('forumType') as string].name
const personalBlogpostTooltip = personalBlogpostInfo[getSetting('forumType') as string].tooltip

// Filter settings
// Appears in the gear-menu by latest posts, and in other places.
//
// filterSettings is the current configuration; setFilterSettings applies a
// change.
//
// When this is first opened, it pre-populates the set of tags with neutral
// filters of a core set of "suggested as filter" tags.
const TagFilterSettings = ({ filterSettings, setFilterSettings, classes }: {
  filterSettings: FilterSettings
  setFilterSettings: (newSettings: FilterSettings)=>void,
  classes: ClassesType,
}) => {
  const { AddTagButton, FilterMode, Loading } = Components
  const [addedSuggestedTags, setAddedSuggestedTags] = useState(false);

  const { results: suggestedTags, loading: loadingSuggestedTags } = useMulti({
    terms: {
      view: "suggestedFilterTags",
    },
    collection: Tags,
    fragmentName: "TagFragment",
    limit: 100,
  });

  const { captureEvent } = useTracking()

  if (suggestedTags && !addedSuggestedTags) {
    const filterSettingsWithSuggestedTags = addSuggestedTagsToSettings(filterSettings, suggestedTags);
    setAddedSuggestedTags(true);
    if (!_.isEqual(filterSettings, filterSettingsWithSuggestedTags))
      setFilterSettings(filterSettingsWithSuggestedTags);
  }

  return <div className={classes.root}>
    {filterSettings.tags.map(tagSettings =>
      <FilterMode
        label={tagSettings.tagName}
        key={tagSettings.tagId}
        tagId={tagSettings.tagId}
        mode={tagSettings.filterMode}
        canRemove={true}
        onChangeMode={(mode: FilterMode) => {
          const changedTagId = tagSettings.tagId;
          const replacedIndex = _.findIndex(filterSettings.tags, t=>t.tagId===changedTagId);
          let newTagFilters = [...filterSettings.tags];
          newTagFilters[replacedIndex] = {
            ...filterSettings.tags[replacedIndex],
            filterMode: mode
          };
          captureEvent('tagFilterModified', {tagId: tagSettings._id, tagName: tagSettings.tagName, mode})

          setFilterSettings({
            personalBlog: filterSettings.personalBlog,
            tags: newTagFilters,
          });
        }}
        onRemove={() => {
          setFilterSettings({
            personalBlog: filterSettings.personalBlog,
            tags: _.filter(filterSettings.tags, t=>t.tagId !== tagSettings.tagId),
          });
          captureEvent("tagRemovedFromFilters", {tagId: tagSettings.tagId, tagName: tagSettings.tagName});
        }}
      />
    )}

    <FilterMode
      label={personalBlogpostName}
      description={personalBlogpostTooltip}
      mode={filterSettings.personalBlog}
      canRemove={false}
      onChangeMode={(mode: FilterMode) => {
        setFilterSettings({
          personalBlog: mode,
          tags: filterSettings.tags,
        });
      }}
    />

    {<AddTagButton onTagSelected={({tagId,tagName}: {tagId: string, tagName: string}) => {
        if (!_.some(filterSettings.tags, t=>t.tagId===tagId)) {
          const newFilter: FilterTag = {tagId, tagName, filterMode: "Default"}
          setFilterSettings({
            personalBlog: filterSettings.personalBlog,
            tags: [...filterSettings.tags, newFilter]
          });
          captureEvent("tagAddedToFilters", {tagId, tagName})
        }
      }}/>}
    {loadingSuggestedTags && <Loading/>}
  </div>
}

const addSuggestedTagsToSettings = (oldFilterSettings: FilterSettings, suggestedTags: Array<TagFragment>): FilterSettings => {
  const tagsIncluded = {};
  for (let tag of oldFilterSettings.tags)
    tagsIncluded[tag.tagId] = true;
  const tagsNotIncluded = _.filter(suggestedTags, tag=>!(tag._id in tagsIncluded));

  return {
    ...oldFilterSettings,
    tags: [
      ...oldFilterSettings.tags,
      ...tagsNotIncluded.map(tag => ({
        tagId: tag._id,
        tagName: tag.name,
        filterMode: "Default",
      })),
    ],
  };
}

const TagFilterSettingsComponent = registerComponent("TagFilterSettings", TagFilterSettings, {styles});

declare global {
  interface ComponentTypes {
    TagFilterSettings: typeof TagFilterSettingsComponent
  }
}
