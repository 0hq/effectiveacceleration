import React, { useEffect, useState, useCallback } from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useLocation } from '../../lib/routeUtil';
import { useTagBySlug } from './useTag';
import { Link } from '../../lib/reactRouterWrapper';
import { useCurrentUser } from '../common/withUser';
import { tagBodyStyles } from '../../themes/stylePiping'
import { AnalyticsContext, useTracking } from "../../lib/analyticsEvents";
import { truncate } from '../../lib/editor/ellipsize';
import { tagGetUrl } from '../../lib/collections/tags/helpers';
import { useMulti } from '../../lib/crud/withMulti';
import { EditTagForm } from './EditTagPage';
import { MAX_COLUMN_WIDTH } from '../posts/PostsPage/PostsPage';
import classNames from 'classnames';

// Also used in TagCompareRevisions, TagDiscussionPage
export const styles = (theme: ThemeType): JssStyles => ({
  description: {
    marginTop: 18,
    ...tagBodyStyles(theme),
    marginBottom: 18,
  },
  centralColumn: {
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: MAX_COLUMN_WIDTH,
  },
  header: {
    paddingTop: 19,
    paddingBottom: 5,
    paddingLeft: 42,
    paddingRight: 42,
    background: "white",
  },
  tableOfContentsWrapper: {
    position: "relative",
    top: 12,
  },
  title: {
    ...theme.typography.display3,
    ...theme.typography.commentStyle,
    marginTop: 0,
    fontWeight: 600,
    fontVariant: "small-caps"
  },
  wikiSection: {
    paddingTop: 5,
    paddingLeft: 42,
    paddingRight: 42,
    paddingBottom: 12,
    marginBottom: 24,
    background: "white",
  },
  tagHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...theme.typography.body2,
    ...theme.typography.commentStyle,
  },
  postsTaggedTitle: {
    color: theme.palette.grey[600]
  },
  pastRevisionNotice: {
    ...theme.typography.commentStyle,
    fontStyle: 'italic'
  },
  nextLink: {
    ...theme.typography.commentStyle
  },
});

export const tagPostTerms = (tag: TagBasicInfo | null, query: any) => {
  if (!tag) return
  return ({
    ...query,
    filterSettings: {tags:[{tagId: tag._id, tagName: tag.name, filterMode: "Required"}]},
    view: "tagRelevance",
    tagId: tag._id,
  })
}

const TagPage = ({classes}: {
  classes: ClassesType
}) => {
  const { PostsListSortDropdown, PostsList2, ContentItemBody, Loading, AddPostsToTag, Error404, PermanentRedirect, HeadTags, UsersNameDisplay, TagFlagItem, TagDiscussionSection, Typography, TagPageButtonRow, ToCColumn, TableOfContents, TagContributorsList } = Components;
  const currentUser = useCurrentUser();
  const { query, params: { slug } } = useLocation();
  const { revision } = query;
  const { tag, loading: loadingTag } = useTagBySlug(slug, revision ? "TagPageWithRevisionFragment" : "TagPageFragment", {
    extraVariables: revision ? {version: 'String'} : {},
    extraVariablesValues: revision ? {version: revision} : {},
  });
  
  const [truncated, setTruncated] = useState(true)
  const [editing, setEditing] = useState(!!query.edit)
  const { captureEvent } =  useTracking()

  const multiTerms = {
    allPages: {view: "allPagesByNewest"},
    myPages: {view: "userTags", userId: currentUser?._id},
    //tagFlagId handled as default case below
  }

  const { results: otherTagsWithNavigation } = useMulti({
    terms: ["allPages", "myPages"].includes(query.focus) ? multiTerms[query.focus] : {view: "tagsByTagFlag", tagFlagId: query.focus},
    collectionName: "Tags",
    fragmentName: 'TagWithFlagsFragment',
    limit: 1500,
    skip: !query.flagId
  })
  

  const tagPositionInList = otherTagsWithNavigation?.findIndex(tagInList => tag?._id === tagInList._id);
  // We have to handle updates to the listPosition explicitly, since we have to deal with three cases
  // 1. Initially the listPosition is -1 because we don't have a list at all yet
  // 2. Then we have the real position
  // 3. Then we remove the tagFlag, we still want it to have the right next button
  const [nextTagPosition, setNextTagPosition] = useState<number | null>(null);
  useEffect(() => {
    // Initial list position setting
    if (tagPositionInList >= 0) {
      setNextTagPosition(tagPositionInList + 1)
    }
    if (nextTagPosition !== null && tagPositionInList < 0) {
      // Here we want to decrement the list positions by one, because we removed the original tag and so
      // all the indices are moved to the next
      setNextTagPosition(nextTagPosition => (nextTagPosition || 1) - 1)
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagPositionInList])
  const nextTag = otherTagsWithNavigation && (nextTagPosition !== null && nextTagPosition >= 0) && otherTagsWithNavigation[nextTagPosition]
  
  const expandAll = useCallback(() => {
    setTruncated(false)
  }, []);

  if (loadingTag)
    return <Loading/>
  if (!tag)
    return <Error404/>
  // If the slug in our URL is not the same as the slug on the tag, redirect to the canonical slug page
  if (tag.oldSlugs?.filter(slug => slug !== tag.slug)?.includes(slug)) {
    return <PermanentRedirect url={tagGetUrl(tag)} />
  }

  const terms = {
    ...tagPostTerms(tag, query),
    limit: 15
  }

  const clickReadMore = () => {
    setTruncated(false)
    captureEvent("readMoreClicked", {tagId: tag._id, tagName: tag.name, pageSectionContext: "wikiSection"})
  }

  const htmlWithAnchors = tag.tableOfContents?.html || tag.description?.html;
  const description = (truncated && !tag.wikiOnly)
    ? truncate(htmlWithAnchors, tag.descriptionTruncationCount || 4, "paragraphs", "<span>...<p><a>(Read More)</a></p></span>")
    : htmlWithAnchors
  const headTagDescription = tag.description?.plaintextDescription || `All posts related to ${tag.name}, sorted by relevance`
  
  const tagFlagItemType = {
    allPages: "allPages",
    myPages: "userPages"
  }
  
  return <AnalyticsContext
    pageContext='tagPage'
    tagName={tag.name}
    tagId={tag._id}
    sortedBy={query.sortedBy || "relevance"}
    limit={terms.limit}
  >
    <HeadTags
      description={headTagDescription}
    />
    <ToCColumn
      tableOfContents={
        tag.tableOfContents
          ? <span className={classes.tableOfContentsWrapper}>
              <TableOfContents
                sectionData={tag.tableOfContents}
                title={tag.name}
                onClickSection={expandAll}
              />
              <TagContributorsList tag={tag}/>
            </span>
          : null
      }
      header={<div className={classNames(classes.header,classes.centralColumn)}>
        <div>
          {query.flagId && <span>
            <Link to={`/tags/dashboard?focus=${query.flagId}`}>
              <TagFlagItem 
                itemType={["allPages", "myPages"].includes(query.flagId) ? tagFlagItemType[query.flagId] : "tagFlagId"}
                documentId={query.flagId}
              />
            </Link>
            {nextTag && <span onClick={() => setEditing(true)}><Link
              className={classes.nextLink}
              to={tagGetUrl(nextTag, {flagId: query.flagId, edit: true})}>
                Next Tag ({nextTag.name})
            </Link></span>}
          </span>}
          <Typography variant="display3" className={classes.title}>
            {tag.name}
          </Typography>
        </div>
        <TagPageButtonRow tag={tag} editing={editing} setEditing={setEditing} />
      </div>}
    >
      <div className={classNames(classes.wikiSection,classes.centralColumn)}>
        <AnalyticsContext pageSectionContext="wikiSection">
          { revision && tag.description && (tag as TagRevisionFragment)?.description?.user && <div className={classes.pastRevisionNotice}>
            You are viewing revision {(tag as TagRevisionFragment)?.description?.version}, last edited by <UsersNameDisplay user={(tag as TagRevisionFragment)?.description?.user}/>
          </div>}
          {editing ? <EditTagForm
            tag={tag}
            successCallback={() => setEditing(false)}
            cancelCallback={() => setEditing(false)}
          /> :
          <div onClick={clickReadMore}>
            <ContentItemBody
              dangerouslySetInnerHTML={{__html: description||""}}
              description={`tag ${tag.name}`}
              className={classes.description}
            />
          </div>}
        </AnalyticsContext>
      </div>
      <div className={classes.centralColumn}>
        {editing && <TagDiscussionSection
          key={tag._id}
          tag={tag}
        />}
        {!tag.wikiOnly && <AnalyticsContext pageSectionContext="tagsSection">
          <div className={classes.tagHeader}>
            <div className={classes.postsTaggedTitle}>Posts tagged <em>{tag.name}</em></div>
            <PostsListSortDropdown value={query.sortedBy || "relevance"}/>
          </div>
          <PostsList2
            terms={terms}
            enableTotal
            tagId={tag._id}
            itemsPerPage={200}
          >
            <AddPostsToTag tag={tag} />
          </PostsList2>
        </AnalyticsContext>}
      </div>
    </ToCColumn>
  </AnalyticsContext>
}

const TagPageComponent = registerComponent("TagPage", TagPage, {styles});

declare global {
  interface ComponentTypes {
    TagPage: typeof TagPageComponent
  }
}
