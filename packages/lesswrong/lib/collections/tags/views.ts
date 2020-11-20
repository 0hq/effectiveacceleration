import { Tags } from './collection';
import { ensureIndex } from '../../collectionUtils';
import { viewFieldAllowAny } from '../../vulcan-lib';

Tags.addDefaultView(terms => {
  return {
    selector: {
      deleted: false,
      adminOnly: false,
      wikiOnly: false
    },
  };
});
ensureIndex(Tags, {deleted:1, adminOnly:1});

Tags.addView('allTagsAlphabetical', terms => {
  return {
    selector: {},
    options: {sort: {name: 1}}
  }
});
ensureIndex(Tags, {deleted:1, adminOnly:1, name: 1});

Tags.addView("userTags", terms => {
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

Tags.addView('allPagesByNewest', terms => {
  return {
    selector: {
      wikiOnly: viewFieldAllowAny
    },
    options: {sort: {createdAt: -1}},
  }
});
ensureIndex(Tags, {deleted:1, adminOnly:1, wikiOnly: 1, createdAt: 1});

Tags.addView('allTagsHierarchical', terms => {
  const selector = parseInt(terms?.wikiGrade) ? {wikiGrade: parseInt(terms?.wikiGrade)} : {}
  return {
    selector,
    options: {sort: {defaultOrder: -1, postCount: -1, name: 1}}
  }
});

ensureIndex(Tags, {deleted:1, adminOnly:1, wikiGrade: 1, defaultOrder: 1, postCount: 1, name: 1});

Tags.addView('tagBySlug', terms => {
  return {
    selector: {
      $or: [{slug: terms.slug}, {oldSlugs: terms.slug}],
      adminOnly: viewFieldAllowAny,
      wikiOnly: viewFieldAllowAny
    },
  };
});
ensureIndex(Tags, {deleted: 1, slug:1, oldSlugs: 1});

Tags.addView('coreTags', terms => {
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


Tags.addView('newTags', terms => {
  return {
    options: {
      sort: {
        createdAt: -1
      }
    }
  }
})
ensureIndex(Tags, {deleted: 1, createdAt: 1});

Tags.addView('unreviewedTags', terms => {
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

Tags.addView('suggestedFilterTags', terms => {
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

Tags.addView('allLWWikiTags', terms => {
  return {
    selector: {
      wikiOnly: viewFieldAllowAny,
      lesswrongWikiImportSlug: {$exists: true},
    }
  }
});

ensureIndex(Tags, {deleted: 1, adminOnly: 1, lesswrongWikiImportSlug: 1});

Tags.addView('unprocessedLWWikiTags', terms => {
  return {
    selector: {
      wikiOnly: viewFieldAllowAny,
      tagFlagsIds: 'B5nzngQDDci4syEzD',
    }
  }
});

ensureIndex(Tags, {deleted: 1, adminOnly: 1, tagFlagsIds: 1});


Tags.addView('tagsByTagFlag', terms => {
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
