// Settings = new Meteor.Collection('settings');

Settings = new Meteor.Collection("settings", {
    schema: new SimpleSchema({
        title: {
            type: String,
            label: "Title",
            optional: true
        },
        tagline: {
            type: String,
            label: "Tagline",
            optional: true
        },
        requireViewInvite: {
            type: Boolean,
            label: "Require invite to view",
            optional: true
        },
        requirePostInvite: {
            type: Boolean,
            label: "Require invite to post",
            optional: true
        },
        requirePostsApproval: {
            type: Boolean,
            label: "Posts must be approved by admin",
            optional: true
        },
        emailNotifications: {
            type: Boolean,
            label: "Enable email notifications",
            optional: true
        },
        nestedComments: {
            type: Boolean,
            label: "Enable nested comments",
            optional: true
        },
        redistributeKarma: {
            type: Boolean,
            label: "Enable redistributed karma",
            optional: true
        },
        defaultEmail: {
            type: String,
            optional: true
        },       
        scoreUpdateInterval: {
            type: Number,
            optional: true
        }, 
        postInterval: {
            type: Number,
            optional: true
        },
        commentInterval: {
            type: Number,
            optional: true
        },
        maxPostsPerDay: {
            type: Number,
            optional: true
        },
        startInvitesCount: {
            type: Number,
            defaultValue: 3,
            optional: true
        },
        postsPerPage: {
            type: Number,
            defaultValue: 10,
            optional: true
        },
        logoUrl: {
            type: String,
            optional: true
        },
        logoHeight: {
            type: Number,
            optional: true
        },
        logoWidth: {
            type: Number,
            optional: true
        },
        language: {
            type: String,
            defaultValue: 'en',
            optional: true
        },
        backgroundColor: {
            type: String,
            optional: true
        },
        secondaryColor: {
            type: String,
            optional: true
        },
        buttonColor: {
            type: String,
            optional: true
        },
        headerColor: {
            type: String,
            optional: true
        },
        googleAnalyticsId: {
            type: String,
            optional: true
        },
        mixpanelId: {
            type: String,
            optional: true
        },
        clickyId: {
            type: String,
            optional: true
        },
        embedlyId: {
            type: String,
            optional: true
        },
        mailChimpAPIKey: {
            type: String,
            optional: true
        },
        mailChimpListId: {
            type: String,
            optional: true
        },
        footerCode: {
            type: String,
            optional: true
        },
        extraCode: {
            type: String,
            optional: true
        },
        notes: {
            type: String,
            optional: true
        },                                                                                                                                                                                 
    })
});

Settings.allow({
  insert: isAdminById
, update: isAdminById
, remove: isAdminById
});

