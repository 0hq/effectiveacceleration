import Posts from 'meteor/vulcan:posts';

/**
 * @summary Base parameters that will be common to all other view unless specific properties are overwritten
 */
Posts.addDefaultView(terms => ({
  selector: {
    status: Posts.config.STATUS_APPROVED,
    draft: {$ne: true},
    isFuture: {$ne: true} // match both false and undefined
  }
}));

/**
 * @summary Draft view
 */
Posts.addView("draft", terms => {
  return {
    selector: {
      userId: terms.userId,
      draft: true
    },
    options: {
      sort: {createdAt: -1}
    }
}});

/**
 * @summary All drafts view
 */
Posts.addView("all_draft", terms => ({
  selector: {
    draft: true
  },
  options: {
    sort: {createdAt: -1}
  }
}));
