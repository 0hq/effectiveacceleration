import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { Link } from '../../lib/reactRouterWrapper';

const styles = theme => ({
  nominating: {
    marginTop: 8,
    fontSize: "1.2rem"
  },
  postTitle: {
    marginTop: 5
  },
  text: {
    marginTop: "1em",
    paddingTop: "1em",
    color: theme.palette.grey[600],
    borderTop: "solid 1px rgba(0,0,0,.15)",
    textAlign: "center"
  },
  link: {
    color: theme.palette.primary.main,
    display: "block",
    marginTop: 10
  },
  hintText: {
    '& p': {
      marginTop: 2,
      marginBottom: 2
    }
  }
})


const NominatePostDialog = ({classes, post, onClose}: {
  classes: ClassesType,
  post: PostsBase,
  onClose: ()=>void,
}) => {
  const { CommentsNewForm } = Components;

  const hintText = <div className={classes.hintText}>
    <p>How has this post been useful to you over the past year or two?</p> 
    <p>Has it influenced your overall thinking, or been useful for particular projects or decisions?</p>
    <p>(The more specific and concrete, the more helpful!</p>
  </div>

  return (
    <Dialog open={true}
      onClose={onClose}
      fullWidth maxWidth="sm"
    >
      <DialogTitle>
        <div className={classes.nominating}>Nominating for the 2018 Review:</div>
        <div className={classes.postTitle}>{post.title}</div>
      </DialogTitle>
      <DialogContent>
        <CommentsNewForm
          post={post}
          padding={false}
          successCallback={onClose}
          enableGuidelines={false}
          removeFields={['af']}
          type="comment"
          formProps={{
            editorHintText: hintText
          }}
          prefilledProps={{
            nominatedForReview: "2018"
          }}
        />
        <Typography variant="body2" className={classes.text}>
          This will appear as a comment on the original post. You can edit it afterwards. 
          <Link 
            className={classes.link}
            target="_blank"
            to={"/posts/qXwmMkEBLL59NkvYR/the-lesswrong-2018-review"}
          >
            Click here for more information on the 2018 Review
          </Link>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

const NominatePostDialogComponent = registerComponent('NominatePostDialog', NominatePostDialog, {styles});

declare global {
  interface ComponentTypes {
    NominatePostDialog: typeof NominatePostDialogComponent
  }
}

