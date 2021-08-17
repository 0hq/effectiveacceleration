/* global confirm */
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { withUpdate } from '../../lib/crud/withUpdate';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useCurrentUser } from '../common/withUser';
import withErrorBoundary from '../common/withErrorBoundary'
import DoneIcon from '@material-ui/icons/Done';
import FlagIcon from '@material-ui/icons/Flag';
import SnoozeIcon from '@material-ui/icons/Snooze';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import OutlinedFlagIcon from '@material-ui/icons/OutlinedFlag';
import DescriptionIcon from '@material-ui/icons/Description'
import { useMulti } from '../../lib/crud/withMulti';
import MessageIcon from '@material-ui/icons/Message'
import Button from '@material-ui/core/Button';
import * as _ from 'underscore';
import { DatabasePublicSetting } from '../../lib/publicSettings';
import Input from '@material-ui/core/Input';
import { userCanDo } from '../../lib/vulcan-users/permissions';

const defaultModeratorPMsTagSlug = new DatabasePublicSetting<string>('defaultModeratorPMsTagSlug', "moderator-default-responses") // ea-forum-look-here

export const getTitle = (s: string|null) => s ? s.split("\\")[0] : ""

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    backgroundColor: theme.palette.grey[50]
  },
  icon: {
    height: 13,
    color: theme.palette.grey[500],
    position: "relative",
    top: 3
  },
  hoverPostIcon: {
    height: 16,
    color: theme.palette.grey[700],
    position: "relative",
    top: 3
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  disabled: {
    opacity: .2,
    cursor: "default"
  },
  bigDownvotes: {
    color: theme.palette.error.dark,
    padding: 6,
    paddingTop: 3,
    paddingBottom: 3,
    marginRight:8,
    borderRadius: "50%",
    fontWeight: 600,
    border: `solid 2px ${theme.palette.error.dark}`
  },
  downvotes: {
    color: theme.palette.error.dark,
    opacity: .75,
    padding: 6,
    paddingTop: 3,
    paddingBottom: 3,
    marginRight:8,
    borderRadius: "50%",
    border: `solid 1px ${theme.palette.error.dark}`
  },
  upvotes: {
    color: theme.palette.primary.dark,
    opacity: .75,
    padding: 6,
    paddingTop: 3,
    paddingBottom: 3,
    marginRight:8,
    borderRadius: "50%",
    border: `solid 1px ${theme.palette.primary.dark}`
  },
  bigUpvotes: {
    color: theme.palette.primary.dark,
    padding: 6,
    paddingTop: 3,
    paddingBottom: 3,
    marginRight:8,
    borderRadius: "50%",
    fontWeight: 600,
    border: `solid 2px ${theme.palette.primary.dark}`
  },
  votesRow: {
    marginTop: 12,
    marginBottom: 12
  },
  hr: {
    height: 0,
    borderTop: "none",
    borderBottom: "1px solid #ccc"
  },
  editIcon: {
    width: 20,
    color: theme.palette.grey[400]
  },
  notes: {
    border: "solid 1px rgba(0,0,0,.2)",
    borderRadius: 2,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    marginTop: 8,
    marginBottom: 8
  },
  defaultMessage: {
    maxWidth: 500,
    backgroundColor: "white",
    padding:12,
    boxShadow: "0 0 10px rgba(0,0,0,0.5)"
  }
})
const SunshineNewUsersInfo = ({ user, classes, updateUser }: {
  user: SunshineUsersList,
  classes: ClassesType,
  updateUser?: any
}) => {
  const currentUser = useCurrentUser();

  const [notes, setNotes] = useState(user.sunshineNotes || "")

  const canReview = !!(user.maxCommentCount || user.maxPostCount)

  const handleNotes = () => {
    if (notes != user.sunshineNotes) {
      updateUser({
        selector: {_id: user._id},
        data: {
          sunshineNotes: notes
        }
      })
    }
  }

  useEffect(() => {
    return () => {
      handleNotes();
    }
  });

  const handleReview = () => {
    if (canReview) {
      updateUser({
        selector: {_id: user._id},
        data: {
          sunshineFlagged: false,
          reviewedByUserId: currentUser!._id,
          reviewedAt: new Date(),
          sunshineSnoozed: false,
          needsReview: false,
          sunshineNotes: notes
        }
      })
    }
  }

  const handleSnooze = () => {
    updateUser({
      selector: {_id: user._id},
      data: {
        needsReview: false,
        reviewedAt: new Date(),
        reviewedByUserId: currentUser!._id,
        sunshineSnoozed: true,
        sunshineNotes: notes
      }
    })

    setNotes( signatureWithNote("Snooze")+notes )
  }

  const banMonths = 3

  const handleBan = async () => {
    if (confirm(`Ban this user for ${banMonths} months?`)) {
      await updateUser({
        selector: {_id: user._id},
        data: {
          sunshineFlagged: false,
          reviewedByUserId: currentUser!._id,
          voteBanned: true,
          needsReview: false,
          reviewedAt: new Date(),
          banned: moment().add(banMonths, 'months').toDate(),
          sunshineNotes: notes
        }
      })
      setNotes( signatureWithNote("Ban")+notes )
    }
  }

  const handlePurge = async () => {
    if (confirm("Are you sure you want to delete all this user's posts, comments and votes?")) {
      await updateUser({
        selector: {_id: user._id},
        data: {
          sunshineFlagged: false,
          reviewedByUserId: currentUser!._id,
          nullifyVotes: true,
          voteBanned: true,
          deleteContent: true,
          needsReview: false,
          reviewedAt: new Date(),
          banned: moment().add(1000, 'years').toDate(),
          sunshineNotes: notes
        }
      })
      setNotes( signatureWithNote("Purge")+notes )
    }
  }

  const handleFlag = () => {
    updateUser({
      selector: {_id: user._id},
      data: {
        sunshineFlagged: !user.sunshineFlagged,
        sunshineNotes: notes
      }
    })

    const flagStatus = user.sunshineFlagged ? "Unflag" : "Flag"
    setNotes( signatureWithNote(flagStatus)+notes )
  }

  const { results: posts, loading: postsLoading } = useMulti({
    terms:{view:"sunshineNewUsersPosts", userId: user._id},
    collectionName: "Posts",
    fragmentName: 'SunshinePostsList',
    fetchPolicy: 'cache-and-network',
    limit: 50
  });

  const { results: comments, loading: commentsLoading } = useMulti({
    terms:{view:"sunshineNewUsersComments", userId: user._id},
    collectionName: "Comments",
    fragmentName: 'CommentsListWithParentMetadata',
    fetchPolicy: 'cache-and-network',
    limit: 50
  });


  const commentKarmaPreviews = comments ? _.sortBy(comments, c=>c.baseScore) : []
  const postKarmaPreviews = posts ? _.sortBy(posts, p=>p.baseScore) : []

  const { MetaInfo, FormatDate, SunshineNewUserPostsList, SunshineNewUserCommentsList, CommentKarmaWithPreview, PostKarmaWithPreview, LWTooltip, Loading, Typography, SunshineSendMessageWithDefaults } = Components

  const hiddenPostCount = user.maxPostCount - user.postCount
  const hiddenCommentCount = user.maxCommentCount - user.commentCount

  if (!userCanDo(currentUser, "posts.moderate.all")) return null

  const getTodayString = () => {
    const today = new Date();
    return today.toLocaleString('default', { month: 'short', day: 'numeric'});
  }

  const signature = `${currentUser?.displayName}, ${getTodayString()}`
  const signatureWithNote = (note:string) => {
    return `${signature}: ${note}\n`
  }

  const signAndDate = (sunshineNotes:string) => {
    if (!sunshineNotes.match(signature)) {
      const padding = !sunshineNotes ? ": " : ": \n\n"
      return signature + padding + sunshineNotes
    } 
    return sunshineNotes
  }

  const handleClick = () => {
    const signedNotes = signAndDate(notes)
    if (signedNotes != notes) {
      setNotes(signedNotes)
    }
  }

  return (
      <div className={classes.root}>
        <Typography variant="body2">
          <MetaInfo>
            {user.reviewedAt ? <p><em>Reviewed <FormatDate date={user.reviewedAt}/> ago by {user.reviewedByUserId}</em></p> : null }
            {user.banned ? <p><em>Banned until <FormatDate date={user.banned}/></em></p> : null }
            <div>ReCaptcha Rating: {user.signUpReCaptchaRating || "no rating"}</div>
            <div dangerouslySetInnerHTML={{__html: user.htmlBio}}/>
            <div className={classes.notes}>
              <Input 
                value={notes} 
                fullWidth
                onChange={e => setNotes(e.target.value)}
                onClick={e => handleClick()}
                disableUnderline 
                placeholder="Notes for other moderators"
                multiline
              />
            </div>
            <div className={classes.row}>
              <div className={classes.row}>
                <LWTooltip title="Approve">
                  <Button onClick={handleReview} className={canReview ? null : classes.disabled }>
                    <DoneIcon/>
                  </Button>
                </LWTooltip>
                <LWTooltip title="Snooze (approve all posts)">
                  <Button title="Snooze" onClick={handleSnooze}>
                    <SnoozeIcon />
                  </Button>
                </LWTooltip>
                <LWTooltip title="Ban for 3 months">
                  <Button onClick={handleBan}>
                    <RemoveCircleOutlineIcon />
                  </Button>
                </LWTooltip>
                <LWTooltip title="Purge (delete and ban)">
                  <Button onClick={handlePurge}>
                    <DeleteForeverIcon />
                  </Button>
                </LWTooltip>
                <LWTooltip title={user.sunshineFlagged ? "Unflag this user" : <div>
                  <div>Flag this user for more review</div>
                  <div><em>(This will not remove them from sidebar)</em></div>
                </div>}>
                  <Button onClick={handleFlag}>
                    {user.sunshineFlagged ? <FlagIcon /> : <OutlinedFlagIcon />}
                  </Button>
                </LWTooltip>
              </div>
              <div className={classes.row}>
                <SunshineSendMessageWithDefaults user={user} tagSlug={defaultModeratorPMsTagSlug.get()}/>
              </div>
            </div>
            <hr className={classes.hr}/>
            <div className={classes.votesRow}>
              <LWTooltip title="Big Upvotes">
                <span className={classes.bigUpvotes}>
                  { user.bigUpvoteCount || 0 }
                </span>
              </LWTooltip>
              <LWTooltip title="Upvotes">
                <span className={classes.upvotes}>
                  { user.smallUpvoteCount || 0 }
                </span>
              </LWTooltip>
              <LWTooltip title="Downvotes">
                <span className={classes.downvotes}>
                  { user.smallDownvoteCount || 0 }
                </span>
              </LWTooltip>
              <LWTooltip title="Big Downvotes">
                <span className={classes.bigDownvotes}>
                  { user.bigDownvoteCount || 0 }
                </span>
              </LWTooltip>
            </div>
            <div>
              <LWTooltip title="Post count">
                <span>
                  { user.postCount || 0 }
                  <DescriptionIcon className={classes.hoverPostIcon}/>
                </span> 
              </LWTooltip>
              {postKarmaPreviews.map(post => <PostKarmaWithPreview key={post._id} post={post}/>)}
              { hiddenPostCount ? <span> ({hiddenPostCount} deleted)</span> : null} 
            </div>
            {(commentsLoading || postsLoading) && <Loading/>}
            <div>
              <LWTooltip title="Comment count">
                { user.commentCount || 0 }
              </LWTooltip>
              <MessageIcon className={classes.icon}/> 
              {commentKarmaPreviews.map(comment => <CommentKarmaWithPreview key={comment._id} comment={comment}/>)}
              { hiddenCommentCount ? <span> ({hiddenCommentCount} deleted)</span> : null}
            </div>
            <SunshineNewUserPostsList posts={posts} user={user}/>
            <SunshineNewUserCommentsList comments={comments} user={user}/>
          </MetaInfo>
        </Typography>
      </div>
  )
}

const SunshineNewUsersInfoComponent = registerComponent('SunshineNewUsersInfo', SunshineNewUsersInfo, {
  styles,
  hocs: [
    withUpdate({
      collectionName: "Users",
      fragmentName: 'SunshineUsersList',
    }),
    withErrorBoundary,
  ]
});

declare global {
  interface ComponentTypes {
    SunshineNewUsersInfo: typeof SunshineNewUsersInfoComponent
  }
}
