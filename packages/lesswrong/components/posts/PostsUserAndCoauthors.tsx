import { registerComponent, Components } from '../../lib/vulcan-lib';
import React from 'react';
import ModeCommentIcon from '@material-ui/icons/ModeComment';
import classNames from 'classnames';
import { forumTypeSetting } from '../../lib/instanceSettings';

const styles = (theme: ThemeType): JssStyles => ({
  lengthLimited: {
    maxWidth: 310,
    textOverflow: "ellipsis",
    overflowX: "hidden",
    textAlign: "right",
    [theme.breakpoints.down('xs')]: {
      maxWidth: 160
    },
  },
  lengthUnlimited: {
    display: "inline",
  },
  topCommentAuthor: {
    color: theme.palette.grey[500],
    fontSize: ".95rem"
  },
  topAuthorIcon: {
    width: 12,
    height: 12,
    color: "#d0d0d0",
    position: "relative",
    top: 2,
    marginRight: 4,
    marginLeft: 2,
  },
  new: {
    color: theme.palette.primary.main
  }
});

const PostsUserAndCoauthors = ({post, abbreviateIfLong=false, classes, simple=false, newPromotedComments}: {
  post: PostsList,
  abbreviateIfLong?: boolean,
  classes: ClassesType,
  simple?: boolean,
  newPromotedComments?: boolean
}) => {
  const { UsersName, UserNameDeleted } = Components
  if (!post.user || post.hideAuthor)
    return <UserNameDeleted/>;
  
  const topCommentAuthor = post.question ? post.bestAnswer?.user : post.lastPromotedComment?.user
  const renderTopCommentAuthor = (forumTypeSetting.get() && topCommentAuthor && topCommentAuthor._id != post.user._id)
  
  return <div className={abbreviateIfLong ? classes.lengthLimited : classes.lengthUnlimited}>
    {<UsersName user={post.user} simple={simple} />}
    {post.coauthors.map(coauthor =>
      <span key={coauthor._id}>, <UsersName user={coauthor} simple={simple}  /></span>)}
    {renderTopCommentAuthor && <span className={classNames(classes.topCommentAuthor, {[classes.new]: newPromotedComments})}>
      , <ModeCommentIcon className={classNames(classes.topAuthorIcon, {[classes.new]: newPromotedComments})}/>
      <UsersName user={topCommentAuthor} simple={simple} />
    </span>}
  </div>;
};

const PostsUserAndCoauthorsComponent = registerComponent("PostsUserAndCoauthors", PostsUserAndCoauthors, {styles});

declare global {
  interface ComponentTypes {
    PostsUserAndCoauthors: typeof PostsUserAndCoauthorsComponent
  }
}
