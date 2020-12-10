import React from 'react';
import { Components, registerComponent } from '../../../lib/vulcan-lib';
import { Link } from '../../../lib/reactRouterWrapper';
import LinkIcon from '@material-ui/icons/Link';
import { commentGetPageUrlFromIds } from "../../../lib/collections/comments/helpers";
import classNames from 'classnames';
import { useNavigation, useLocation } from '../../../lib/routeUtil';
import { useTracking } from '../../../lib/analyticsEvents';
import qs from 'qs'

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    "& a:hover, & a:active": {
      "& $icon": {
        color: "rgba(0,0,0,0.3) !important",
      },
    },
  },
  answerDate: {},
  date: {
    color: "rgba(0,0,0,0.5)",
  },
  postTitle: {
    marginRight: 5,
  },
  link: {
  },
  icon: {
    fontSize: "0.9rem",
    transform: "rotate(-45deg)",
    verticalAlign: "middle",
    color: "rgba(0,0,0,0.5)",
    margin: "0 2px",
    position: "relative",
    top: -2
  },
});

const CommentsItemDate = ({comment, post, tag, classes, scrollOnClick, scrollIntoView, permalink=true }: {
  comment: CommentsList,
  post?: PostsMinimumInfo|null,
  tag?: TagBasicInfo,
  classes: ClassesType,
  scrollOnClick?: boolean,
  scrollIntoView?: ()=>void,
  permalink?: boolean,
}) => {
  const { history } = useNavigation();
  const { location } = useLocation();
  const { captureEvent } = useTracking();

  const handleLinkClick = (event: React.MouseEvent) => {
    event.preventDefault()
    history.replace({...location, search: qs.stringify({commentId: comment._id})})
    if(scrollIntoView) scrollIntoView();
    captureEvent("linkClicked", {buttonPressed: event.button, furtherContext: "dateIcon"})
  };

  const url = commentGetPageUrlFromIds({postId: post?._id, postSlug: post?.slug, tagSlug: tag?.slug, commentId: comment._id, permalink})

  const date = <>
    <Components.FormatDate date={comment.postedAt} format={comment.answer ? "MMM DD, YYYY" : undefined}/>
    <LinkIcon className={classes.icon}/>
  </>

  return (
    <span className={classNames(classes.root, {
      [classes.date]: !comment.answer,
      [classes.answerDate]: comment.answer,
    })}>
      {scrollOnClick ? <a rel="nofollow" href={url} onClick={handleLinkClick}>{ date } </a>
        : <Link rel="nofollow" to={url}>{ date }</Link>
      }
    </span>
  );
}

const CommentsItemDateComponent = registerComponent(
  'CommentsItemDate', CommentsItemDate, {styles}
);

declare global {
  interface ComponentTypes {
    CommentsItemDate: typeof CommentsItemDateComponent,
  }
}

