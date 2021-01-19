import { Tags } from './collection';
import { ensureIndex } from '../../collectionUtils';
import { viewFieldAllowAny } from '../../vulcan-lib';

declare global {
  interface TagsViewTerms extends ViewTermsBase {
    view?: TagsViewName
    userId?: string
    wikiGrade?: string
    slug?: string
    tagFlagId?: string
  }
}

Tags.addDefaultView((terms: TagsViewTerms) => {
  return {
    selector: {
      deleted: false,
      adminOnly: false,
      wikiOnly: false
    },
  };
});
ensureIndex(Tags, {deleted:1, adminOnly:1});

Tags.addView('allTagsAlphabetical', (terms: TagsViewTerms) => {
  return {
    selector: {},
    options: {sort: {name: 1}}
  }
});
ensureIndex(Tags, {deleted:1, adminOnly:1, name: 1});

Tags.addView("userTags", (terms: TagsViewTerms) => {
  return {
    selector: {
      userId: terms.userId,
      adminOnly: viewFieldAllowAny,
      wikiOnly: viewFieldAllowAny
    },
    options: {sort: {createdAt: -1}},
  }
});
ensureIndex(Tags, {deleted: 1, userId: 1, createdAt: 1});

Tags.addView('allPagesByNewest', (terms: TagsViewTerms) => {
  return {
    selector: {
      wikiOnly: viewFieldAllowAny
    },
    options: {sort: {createdAt: -1}},
  }
});
ensureIndex(Tags, {deleted:1, adminOnly:1, wikiOnly: 1, createdAt: 1});

Tags.addView('allTagsHierarchical', (terms: TagsViewTerms) => {
  const selector = terms.wikiGrade !== undefined && parseInt(terms.wikiGrade)
    ? {wikiGrade: parseInt(terms.wikiGrade)}
    : {}
  return {
    selector,
    options: {sort: {defaultOrder: -1, postCount: -1, name: 1}}
  }
});

ensureIndex(Tags, {deleted:1, adminOnly:1, wikiGrade: 1, defaultOrder: 1, postCount: 1, name: 1});

Tags.addView('tagBySlug', (terms: TagsViewTerms) => {
  return {
    selector: {
      $or: [{slug: terms.slug}, {oldSlugs: terms.slug}],
      adminOnly: viewFieldAllowAny,
      wikiOnly: viewFieldAllowAny
    },
  };
});
ensureIndex(Tags, {deleted: 1, slug:1, oldSlugs: 1});

Tags.addView('coreTags', (terms: TagsViewTerms) => {
  return {
    selector: {
      core: true,
      adminOnly: viewFieldAllowAny
    },
    options: {
      sort: {
        name: 1
      }
    },
  }
});
ensureIndex(Tags, {deleted: 1, core:1, name: 1});


Tags.addView('newTags', (terms: TagsViewTerms) => {
  return {
    options: {
      sort: {
        createdAt: -1
      }
    }
  }
})
ensureIndex(Tags, {deleted: 1, createdAt: 1});

Tags.addView('unreviewedTags', (terms: TagsViewTerms) => {
  return {
    selector: {
      needsReview: true
    },
    options: {
      sort: {
        createdAt: 1
      }
    },
  }
});
ensureIndex(Tags, {deleted: 1, needsReview: 1, createdAt: 1});

Tags.addView('suggestedFilterTags', (terms: TagsViewTerms) => {
  return {
    selector: {
      suggestedAsFilter: true,
    },
    options: {
      sort: {
        defaultOrder: -1,
        name: 1
      }
    },
  }
});

ensureIndex(Tags, {deleted: 1, adminOnly: 1, suggestedAsFilter: 1, defaultOrder: 1, name: 1});

Tags.addView('allLWWikiTags', (terms: TagsViewTerms) => {
  return {
    selector: {
      wikiOnly: viewFieldAllowAny,
      lesswrongWikiImportSlug: {$exists: true},
    }
  }
});

ensureIndex(Tags, {deleted: 1, adminOnly: 1, lesswrongWikiImportSlug: 1});

Tags.addView('unprocessedLWWikiTags', (terms: TagsViewTerms) => {
  return {
    selector: {
      wikiOnly: viewFieldAllowAny,
      tagFlagsIds: 'B5nzngQDDci4syEzD',
    }
  }
});

ensureIndex(Tags, {deleted: 1, adminOnly: 1, tagFlagsIds: 1});


Tags.addView('tagsByTagFlag', (terms: TagsViewTerms) => {
  return {
    selector: terms.tagFlagId ?
    {
      tagFlagsIds: terms.tagFlagId,
      wikiOnly: viewFieldAllowAny
    } :
    {
      tagFlagsIds: {$exists: true, $gt: []},
      wikiOnly: viewFieldAllowAny
    },
    options: {sort: {createdAt: -1}}
  }
});
