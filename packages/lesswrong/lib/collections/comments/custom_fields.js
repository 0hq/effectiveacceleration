import React from 'react'
import { Components } from "meteor/vulcan:core";
import { Comments } from "meteor/example-forum";
import Users from "meteor/vulcan:users";
import { makeEditable } from '../../editor/make_editable.js'

Comments.addField([

  /**
    The comment author's `_id`
  */
  {
    fieldName: 'userId',
    fieldSchema: {
      type: String,
      optional: true,
      viewableBy: ['guests'],
      insertableBy: ['members'],
      hidden: true,
      resolveAs: {
        fieldName: 'user',
        type: 'User',
        resolver: async (comment, args, {currentUser, Users}) => {
          if (!comment.userId || comment.hideAuthor) return null;
          const user = await Users.loader.load(comment.userId);
          if (!user) return null;
          if (user.deleted) return null;
          return Users.restrictViewableFields(currentUser, Users, user);
        },
        addOriginalField: true
      },
    }
  },

  /**
    Legacy: Boolean used to indicate that post was imported from old LW database
  */
  {
    fieldName: 'legacy',
    fieldSchema: {
      type: Boolean,
      optional: true,
      hidden: true,
      defaultValue: false,
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members'],
    }
  },

  /**
    Legacy ID: ID used in the original LessWrong database
  */
  {
    fieldName: 'legacyId',
    fieldSchema: {
      type: String,
      hidden: true,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members'],
    }
  },

  /**
    Legacy Poll: Boolean to indicate that original LW data had a poll here
  */
  {
    fieldName: 'legacyPoll',
    fieldSchema: {
      type: Boolean,
      optional: true,
      hidden: true,
      defaultValue: false,
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members'],
    }
  },

  /**
    Legacy Parent Id: Id of parent comment in original LW database
  */
  {
    fieldName: 'legacyParentId',
    fieldSchema: {
      type: String,
      hidden: true,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members'],
    }
  },

  /**
    legacyData: A complete dump of all the legacy data we have on this post in a
    single blackbox object. Never queried on the client, but useful for a lot
    of backend functionality, and simplifies the data import from the legacy
    LessWrong database
  */

  {
    fieldName: 'legacyData',
    fieldSchema: {
      type: Object,
      optional: true,
      viewableBy: ['admins'],
      insertableBy: ['admins'],
      editableBy: ['admins'],
      hidden: true,
      blackbox: true,
    }
  },

  /**
    retracted: Indicates whether a comment has been retracted by its author.
    Results in the text of the comment being struck-through, but still readable.
  */

  {
    fieldName: 'retracted',
    fieldSchema: {
      type: Boolean,
      optional: true,
      viewableBy: ['guests'],
      insertableBy: Users.owns,
      editableBy: Users.owns,
      control: "checkbox",
      hidden: true,
    }
  },

  /**
    deleted: Indicates whether a comment has been deleted by an admin.
    Deleted comments and their replies are not rendered by default.
  */

  {
    fieldName: 'deleted',
    fieldSchema: {
      type: Boolean,
      optional: true,
      viewableBy: ['guests'],
      insertableBy: ['members'],
      editableBy: ['members'],
      control: "checkbox",
      hidden: true,
    }
  },

  {
    fieldName: 'deletedPublic',
    fieldSchema: {
      type: Boolean,
      optional: true,
      viewableBy: ['guests'],
      insertableBy: ['members'],
      editableBy: ['members'],
      hidden: true,
    }
  },

  {
    fieldName: 'deletedReason',
    fieldSchema: {
      type: String,
      optional: true,
      viewableBy: ['guests'],
      insertableBy: ['members'],
      editableBy: ['members'],
      hidden: true,
    }
  },

  {
    fieldName: 'deletedDate',
    fieldSchema: {
      type: Date,
      optional: true,
      viewableBy: ['guests'],
      insertableBy: ['members'],
      editableBy: ['members'],
      hidden: true,
    }
  },

  {
    fieldName: 'deletedByUserId',
    fieldSchema: {
      type: String,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['members'],
      insertableBy: ['members'],
      hidden: true,
      resolveAs: {
        fieldName: 'deletedByUser',
        type: 'User',
        resolver: async (comment, args, context) => {
          if (!comment.deletedByUserId) return null;
          const user = await context.Users.loader.load(comment.deletedByUserId);
          return context.Users.restrictViewableFields(context.currentUser, context.Users, user);
        },
        addOriginalField: true
      },
    }
  },

  /**
    spam: Indicates whether a comment has been marked as spam.
    This removes the content of the comment, but still renders replies.
  */

  {
    fieldName: 'spam',
    fieldSchema: {
      type: Boolean,
      optional: true,
      viewableBy: ['guests'],
      insertableBy: ['admins'],
      editableBy: ['admins'],
      control: "checkbox",
      hidden: true,
    }
  },

  /**
    algoliaIndexAt: Last time the record was indexed by algolia. Undefined if it hasn't yet been indexed.
  */

  {
    fieldName: 'algoliaIndexAt',
    fieldSchema: {
      type: Date,
      optional: true,
      viewableBy: ['guests']
    }
  },

  /**
    repliesBlockedUntil: Deactivates replying to this post by anyone except admins and sunshineRegiment members until the specified time is reached.
  */

  {
    fieldName: 'repliesBlockedUntil',
    fieldSchema: {
      type: Date,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['sunshineRegiment', 'admins'],
      insertableBy: ['sunshineRegiment', 'admins'],
      control: 'datetime'
    }
  },

  {
    fieldName: 'needsReview',
    fieldSchema: {
      type: Boolean,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['sunshineRegiment', 'admins'],
      insertableBy: ['sunshineRegiment', 'admins'],
      hidden: true,
    }
  },

  {
    fieldName: 'reviewedByUserId',
    fieldSchema: {
      type: String,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['sunshineRegiment', 'admins'],
      insertableBy: ['sunshineRegiment', 'admins'],
      hidden: true,
      resolveAs: {
        fieldName: 'reviewedByUser',
        type: 'User',
        resolver: async (comment, args, context) => {
          if (!comment.reviewedByUserId) return null;
          const user = await context.Users.loader.load(comment.reviewedByUserId);
          return context.Users.restrictViewableFields(context.currentUser, context.Users, user);
        },
        addOriginalField: true
      },
    }
  },

  /*
    hideAuthor: Displays the author as '[deleted]'. We use this to copy over old deleted comments
    from LW 1.0
  */

  {
    fieldName: 'hideAuthor',
    fieldSchema: {
      type: Boolean,
      optional: true,
      viewableBy: ['guests'],
      editableBy: ['admins'],
      insertableBy: ['admins'],
    }
  },
]);

makeEditable({
  collection: Comments,
  options: {
    // Determines whether to use the comment editor configuration (e.g. Toolbars)
    commentEditor: true,
    // Determines whether to use the comment editor styles (e.g. Fonts)
    commentStyles: true,
    // Sets the algorithm for determing what storage ids to use for local storage management
    getLocalStorageId: (comment, name) => {
      if (comment._id) { return {id: comment._id, verify: true} }
      if (comment.parentCommentId) { return {id: ('parent:' + comment.parentCommentId), verify: false}}
      if (comment.postId) { return {id: ('post:' + comment.postId), verify: false}}
    },
    order: 25
  }
})
