import { getSetting } from 'meteor/vulcan:core';

import '../components/messaging/TitleEditForm.jsx';
import '../components/messaging/ConversationDetails.jsx';
import '../components/messaging/MessageItem.jsx';
import '../components/messaging/ConversationWrapper.jsx';
import '../components/messaging/InboxWrapper.jsx';
import '../components/messaging/InboxNavigation.jsx';
import '../components/messaging/NewConversationButton.jsx';
import '../components/editor/CommentEditor.jsx';
import '../components/editor/EditorFormComponent.jsx';
import '../components/editor/EditTitle.jsx';
import '../components/editor/EditUrl.jsx';
import '../components/editor/SaveDraftButton.jsx';

// RSS Feed Integration
import '../components/feeds/newFeedButton.jsx';
import '../components/feeds/editFeedButton.jsx';
import '../components/feeds/feedItem.jsx';
import '../components/feeds/feedList.jsx';

import '../components/notifications/NotificationsMenu.jsx';
import '../components/notifications/NotificationsList.jsx';
import '../components/notifications/NotificationsItem.jsx';
import '../components/notifications/NotificationsMenuButton.jsx';
import '../components/notifications/NotificationsFullscreenItem.jsx';
import '../components/notifications/NotificationsFullscreenList.jsx';
import '../components/notifications/NotificationsWrapper.jsx';
import '../components/notifications/SubscribeTo.jsx';

import '../components/Layout.jsx';

import '../components/common/FlashMessages.jsx';
import '../components/common/Header.jsx';
import '../components/common/NavigationMenu.jsx';
import '../components/common/Home.jsx';
import '../components/common/Meta.jsx';
import '../components/common/AllPosts.jsx';
import '../components/common/AllComments.jsx';
import '../components/common/Section.jsx';
import '../components/common/Vote.jsx';
import '../components/common/SearchBar.jsx';
import '../components/common/DialogGroup.jsx';
import '../components/common/VotesInfo.jsx';
import '../components/common/DraftJSRenderer.jsx';
import '../components/common/Tooltip.jsx';

// Outgoing RSS Feed builder
import '../components/common/RSSOutLinkbuilder.jsx';

import '../components/posts/PostsBody/PostsBody.jsx';
import '../components/posts/CategoryDisplay.jsx';
import '../components/users/UsersMenu.jsx';
import '../components/users/UsersEditForm.jsx';
import '../components/users/UsersAccount.jsx';
import '../components/users/UsersAccountMenu.jsx';
import '../components/users/UsersProfile.jsx';
import '../components/users/UsersPostsList.jsx';
import '../components/users/UsersNameWrapper.jsx';
import '../components/posts/SuggestCurated.jsx';
import '../components/posts/PostsItem.jsx';
import '../components/posts/PostsItemWrapper.jsx';
import '../components/posts/PostsItemNewCommentsWrapper.jsx';
import '../components/posts/PostsPage.jsx';
import '../components/posts/PostsPageAdminActions.jsx';
import '../components/posts/PostsViews.jsx';
import '../components/posts/PostsSingleSlug.jsx';
import '../components/posts/PostsSingleRoute.jsx';
import '../components/posts/PostsSingleSlugWrapper.jsx';
import '../components/posts/PostsList.jsx';
import '../components/posts/PostsDaily.jsx';
import '../components/posts/PostsLoadMore.jsx';
import '../components/posts/PostsCommentsThread.jsx';
import '../components/posts/PostsCommentsThreadWrapper.jsx';
import '../components/posts/PostsNewForm.jsx';
import '../components/posts/PostsEditForm.jsx';
import '../components/posts/PostsListHeader.jsx';
import '../components/posts/FeaturedPostsPage.jsx';
import '../components/posts/PostsGroupDetails.jsx';

import '../components/localGroups/CommunityHome.jsx';
import '../components/localGroups/CommunityMap.jsx';
import '../components/localGroups/CommunityMapFilter.jsx';
import '../components/localGroups/CommunityMapWrapper.jsx';
import '../components/localGroups/LocalGroupMarker.jsx';
import '../components/localGroups/LocalEventMarker.jsx';
import '../components/localGroups/LocalGroupPage.jsx';
import '../components/localGroups/LocalGroupSingle.jsx';
import '../components/localGroups/GroupFormLink.jsx';
import '../components/localGroups/SmallMapPreview.jsx';
import '../components/localGroups/SmallMapPreviewWrapper.jsx';
import '../components/localGroups/GroupLinks.jsx';
import '../components/localGroups/LocalGroupsList.jsx';
import '../components/localGroups/LocalGroupsItem.jsx';

import '../components/comments/CommentsItem/CommentsItem.jsx';
import '../components/comments/CommentsItem/BanUserFromPostMenuItem.jsx';
import '../components/comments/CommentsItem/BanUserFromAllPostsMenuItem.jsx';
import '../components/comments/CommentsItem/DeleteCommentMenuItem.jsx';
import '../components/comments/CommentsItem/MoveToAlignmentMenuItem.jsx';
import '../components/comments/CommentsItem/CommentDeletedMetadata.jsx';

import '../components/comments/recentDiscussionThread.jsx';
import '../components/comments/recentDiscussionThreadsList.jsx';
import '../components/comments/CommentsEditForm.jsx';
import '../components/comments/CommentsListSection.jsx';
import '../components/comments/CommentsList.jsx';
import '../components/comments/CommentsLoadMore.jsx';
import '../components/comments/CommentsNode.jsx';
import '../components/comments/CommentsViews.jsx';
import '../components/comments/RecentComments.jsx';
import '../components/comments/RecentCommentsItem.jsx';
import '../components/comments/RecentCommentsSingle.jsx';
import '../components/comments/RecentCommentsPage.jsx';
import '../components/comments/ModerationGuidelinesBox.jsx';
import '../components/comments/ModerationGuidelinesLink.jsx';
import '../components/comments/ModerationGuidelinesContent.jsx'

import '../components/search/PostsListEditorSearchHit.jsx';
import '../components/search/PostsSearchHit.jsx';
import '../components/search/PostsSearchAutoComplete.jsx';
import '../components/search/CommentsSearchHit.jsx';
import '../components/search/UsersSearchHit.jsx';
import '../components/search/SequencesSearchHit.jsx';
import '../components/search/SequencesSearchAutoComplete.jsx';
import '../components/search/UsersSearchAutoComplete.jsx';
import '../components/search/UsersAutoCompleteHit.jsx';

import '../components/admin/AdminDashboard.jsx';

import '../components/sunshineDashboard/AdminHome.jsx';
import '../components/sunshineDashboard/ModerationLog.jsx';
import '../components/sunshineDashboard/SunshineDashboard.jsx';
import '../components/sunshineDashboard/ReportForm.jsx';
import '../components/sunshineDashboard/SunshineCommentsItemOverview.jsx';
import '../components/sunshineDashboard/SunshineNewUsersItem.jsx';
import '../components/sunshineDashboard/SunshineNewUsersList.jsx';
import '../components/sunshineDashboard/SunshineNewPostsList.jsx';
import '../components/sunshineDashboard/SunshineNewPostsItem.jsx';
import '../components/sunshineDashboard/SunshineCommentsItem.jsx';
import '../components/sunshineDashboard/SunshineNewCommentsList.jsx';
import '../components/sunshineDashboard/SunshineReportedCommentsList.jsx';
import '../components/sunshineDashboard/SunshineReportsItem.jsx';
import '../components/sunshineDashboard/SunshineCuratedSuggestionsItem.jsx';
import '../components/sunshineDashboard/SunshineCuratedSuggestionsList.jsx';
import '../components/sunshineDashboard/SunshineSidebar.jsx';

// SequenceEditor
import '../components/sequenceEditor/EditSequenceTitle.jsx';

// Sequences
import '../components/sequences/SequencesPage.jsx';
import '../components/sequences/SequencesPostsList.jsx';
import '../components/sequences/SequencesSingle.jsx';
import '../components/sequences/SequencesEditForm.jsx';
import '../components/sequences/SequencesNewForm.jsx';
import '../components/sequences/SequencesHome.jsx';
import '../components/sequences/SequencesGrid.jsx';
import '../components/sequences/SequencesGridWrapper.jsx';
import '../components/sequences/SequencesNavigation.jsx';
import '../components/sequences/CollectionsNavigation.jsx';
import '../components/sequences/SequencesNavigationLink.jsx';
import '../components/sequences/RecommendedReading.jsx';
import '../components/sequences/RecommendedReadingItem.jsx';
import '../components/sequences/RecommendedReadingWrapper.jsx';
import '../components/sequences/SequencesPost.jsx';
import '../components/sequences/SequencesGridItem.jsx';
import '../components/sequences/ChaptersItem.jsx';
import '../components/sequences/ChaptersList.jsx';
import '../components/sequences/ChaptersEditForm.jsx';
import '../components/sequences/ChaptersNewForm.jsx';
import '../components/sequences/CollectionsSingle.jsx';
import '../components/sequences/CollectionsPage.jsx';
import '../components/sequences/CollectionsEditForm.jsx';
import '../components/sequences/BooksNewForm.jsx';
import '../components/sequences/BooksEditForm.jsx';
import '../components/sequences/BooksItem.jsx';
import '../components/collections/CollectionsCard.jsx';
import '../components/sequences/CoreSequences.jsx';
import '../components/sequences/HPMOR.jsx';
import '../components/sequences/Codex.jsx';
import '../components/sequences/ComingSoon.jsx';
import '../components/form-components/PostsListEditor.jsx';
import '../components/form-components/ImageUpload.jsx';
import '../components/form-components/SequencesListEditor.jsx';
import '../components/form-components/SequencesListEditorItem.jsx';
import '../components/form-components/SubmitButton.jsx';
import '../components/form-components/FormSubmit.jsx';
import '../components/form-components/SingleUsersItem.jsx';
import '../components/form-components/SingleUsersItemWrapper.jsx';
import '../components/form-components/UsersListEditor.jsx';
import '../components/form-components/MuiTextField.jsx';
import '../components/form-components/LocationFormComponent.jsx';
import '../components/form-components/MuiTextField.jsx';
import '../components/form-components/MultiSelectButtons.jsx';

import '../components/alignment-forum/AlignmentCheckbox.jsx';
import '../components/alignment-forum/withSetAlignmentPost.jsx';
import '../components/alignment-forum/withSetAlignmentComment.jsx';
if(getSetting('AlignmentForum', false)) {
    import '../components/alignment-forum/AlignmentForumHome.jsx';
}
