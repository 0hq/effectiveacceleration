import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { Link } from '../../lib/reactRouterWrapper';
import { useCurrentUser } from '../common/withUser'
import {AnalyticsContext} from "../../lib/analyticsEvents";
import type { RecommendationsAlgorithm } from '../../lib/collections/users/recommendationSettings';
import classNames from 'classnames';
import { forumTitleSetting, forumTypeSetting, siteNameWithArticleSetting } from '../../lib/instanceSettings';
import { annualReviewAnnouncementPostPathSetting, annualReviewEnd, annualReviewNominationPhaseEnd, annualReviewReviewPhaseEnd, annualReviewStart } from '../../lib/publicSettings';
import moment from 'moment';
import { currentUserCanVote, eligibleToNominate, getReviewPhase, ReviewYear, REVIEW_NAME_IN_SITU, REVIEW_NAME_TITLE, REVIEW_YEAR } from '../../lib/reviewUtils';
import { userIsAdmin } from '../../lib/vulcan-users';

const isEAForum = forumTypeSetting.get() === "EAForum"

const styles = (theme: ThemeType): JssStyles => ({
  timeRemaining: {
  },
  learnMore: {
    color: theme.palette.lwTertiary.main
  },
  subtitle: {
    width: "100%",
    display: 'flex',
    justifyContent: 'space-between'
  },
  reviewTimeline: {
    ...theme.typography.commentStyle,
    display: 'flex',
    marginBottom: 6,
    marginTop: -8
  },
  nominationBlock: {flexGrow: 1, marginRight: 2, flexBasis: 0},
  reviewBlock: {flexGrow: 2, marginRight: 2, flexBasis: 0},
  votingBlock: {flexGrow: 1, flexBasis: 0},
  blockText: {
    color: 'white',
    zIndex: 1,
    whiteSpace: "nowrap",
  },
  blockLabel: {
    marginRight: 10,
  },
  progress: {
    position: 'relative',
    marginBottom: 2,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.14)',
    display: 'flex',
    justifyContent: 'space-between',
    '&:hover': {
      boxShadow: "0px 0px 10px rgba(0,0,0,.1)",
      opacity: 0.9
    }
  },
  activeProgress: {
    backgroundColor: isEAForum ? theme.palette.primary.main : 'rgba(127, 175, 131, 0.5)'
  },
  coloredProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: isEAForum ? theme.palette.lwTertiary.main : 'rgba(127, 175, 131, 0.7)'
  },
  nominationDate: {},
  actionButtonRow: {
    textAlign: "right",
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 8
  },
  actionButtonCTA: {
    backgroundColor: theme.palette.primary.main,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 3,
    color: "white",
    ...theme.typography.commentStyle,
    display: "inline-block",
    marginLeft: 12
  },
  actionButton: {
    border: `solid 1px ${theme.palette.grey[400]}`,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 3,
    color: theme.palette.grey[600],
    ...theme.typography.commentStyle,
    display: "inline-block",
    marginLeft: 12
  },
  adminButton: {
    border: `solid 1px rgba(200,150,100)`,
    color: 'rgba(200,150,100)'
  },
  buttonWrapper: {
    flexGrow: 0,
    flexShrink: 0
  },
  hideOnMobile: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  showOnMobile: {
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  }
})

/**
 * Get the algorithm for review recommendations
 *
 * Needs to be a function so it gets rerun after a potential database setting
 * update that changes the review phase
 */
export function getReviewAlgorithm(): RecommendationsAlgorithm {
  const reviewPhase = getReviewPhase() || "NOMINATIONS"
  
  // Not sure why the type assertion at the end is necessary
  const reviewPhaseInfo = {
    NOMINATIONS: {reviewNominations: REVIEW_YEAR},
    REVIEWS: {reviewReviews: REVIEW_YEAR},
    VOTING: {reviewReviews: REVIEW_YEAR},
  }[reviewPhase] as {reviewNominations: ReviewYear} | {reviewReviews: ReviewYear}
  return {
    method: "sample",
    count: 3,
    scoreOffset: 0,
    scoreExponent: 0,
    personalBlogpostModifier: 0,
    frontpageModifier: 0,
    curatedModifier: 0,
    includePersonal: true,
    includeMeta: true,
    ...reviewPhaseInfo,
    onlyUnread: false,
    excludeDefaultRecommendations: true
  }
}

  
const nominationStartDate = moment.utc(annualReviewStart.get())
const nominationEndDate = moment.utc(annualReviewNominationPhaseEnd.get())
const reviewEndDate = moment.utc(annualReviewReviewPhaseEnd.get())
const voteEndDate = moment.utc(annualReviewEnd.get())

const forumTitle = forumTitleSetting.get()

const nominationPhaseDateRange = <span>{nominationStartDate.format('MMM Do')} – {nominationEndDate.format('MMM Do')}</span>
const reviewPhaseDateRange = <span>{nominationEndDate.clone().add(1, 'day').format('MMM Do')} – {reviewEndDate.format('MMM Do')}</span>
const votingPhaseDateRange = <span>{reviewEndDate.clone().add(1, 'day').format('MMM Do')} – {voteEndDate.format('MMM Do')}</span>

// EA will use LW text next year, so I've kept the forumType genericization
export const overviewTooltip = isEAForum ?
  <div>
    <div>The EA Forum is reflecting on the best EA writing, in three phases</div>
    <ul>
      <li><em>Nomination</em> ({nominationPhaseDateRange})</li>
      <li><em>Review</em> ({reviewPhaseDateRange})</li>
      <li><em>Voting</em> ({votingPhaseDateRange})</li>
    </ul>
    <div>To be eligible, posts must have been posted before January 1st, 2021.</div>
    <br/>
    {/* TODO:(Review) this won't be true in other phases */}
    <div>(Currently this section shows a random sample of eligible posts, weighted by karma)</div>
  </div> :
  <div>
    <div>The {forumTitle} community is reflecting on the best posts from {REVIEW_YEAR}, in three phases:</div>
    <ul>
      <li><em>Preliminary Voting</em> ({nominationPhaseDateRange})</li>
      <li><em>Review</em> ({reviewPhaseDateRange})</li>
      <li><em>Final Voting</em> ({votingPhaseDateRange})</li>
    </ul>
    {!isEAForum && <div>The {forumTitle} moderation team will incorporate that information, along with their judgment, into a "Best of {REVIEW_YEAR}" sequence.</div>}
    <p>We're currently in the preliminary voting phase. Nominate posts by casting a preliminary vote, or vote on existing nominations to help us prioritize them during the Review Phase.</p>
  </div>

const FrontpageReviewWidget = ({classes, showFrontpageItems=true}: {classes: ClassesType, showFrontpageItems?: boolean}) => {
  const { SectionTitle, SettingsButton, RecommendationsList, LWTooltip, SingleLineReviewsList, LatestReview } = Components
  const currentUser = useCurrentUser();

  // These should be calculated at render
  const currentDate = moment.utc()
  const activeRange = getReviewPhase()

  const nominationsTooltip = isEAForum ?
    <div>
      <div>Nominate posts for the {REVIEW_NAME_IN_SITU}</div>
      <ul>
        <li>Any post from before 2021 can be nominated</li>
        <li>Any user registered before the start of the review can nominate posts</li>
        <li>Posts with at least one positive vote proceed to the Review Phase.</li>
      </ul>
      <div>If you've been actively reading {siteNameWithArticleSetting.get()} before now, but didn't register an account, reach out to us on intercom.</div>
    </div> :
    <div>
      <div>Cast initial votes for the {REVIEW_YEAR} Review.</div>
      <ul>
        <li>Nominate a post by casting a <em>preliminary vote</em>, or vote on an existing nomination to help us prioritize it during the Review Phase.</li>
        <li>Any post from {REVIEW_YEAR} can be nominated</li>
        <li>Any user registered before {REVIEW_YEAR} can nominate posts for review</li>
        <li>Posts will need at least one vote to proceed to the Review Phase.</li>
      </ul>
    </div>

  const reviewTooltip = isEAForum ?
    <>
      <div>Review posts for the {REVIEW_NAME_IN_SITU} (Opens {nominationEndDate.clone().add(1, 'day').format('MMM Do')})</div>
      <ul>
        <li>Write reviews of posts nominated for the {REVIEW_NAME_IN_SITU}</li>
        <li>Only posts with at least one review are eligible for the final vote</li>
      </ul>
    </> :
    <>
      <div>Review posts for the {REVIEW_YEAR} Review (Opens {nominationEndDate.clone().add(1, 'day').format('MMM Do')})</div>
      <ul>
        <li>Write reviews of posts nominated for the {REVIEW_YEAR} Review</li>
        <li>Only posts with at least one review are eligible for the final vote</li>
      </ul>
    </>

  const voteTooltip = isEAForum ?
    <>
      <div>Cast your final votes for the {REVIEW_NAME_IN_SITU}. (Opens {reviewEndDate.clone().add(1, 'day').format('MMM Do')})</div>
      <ul>
        <li>Look over nominated posts and vote on them</li>
        <li>Any user registered before {nominationStartDate.format('MMM Do')} can vote in the review</li>
      </ul>
    </> :
    <>
      <div>Cast your final votes for the {REVIEW_YEAR} Review. (Opens {reviewEndDate.clone().add(1, 'day').format('MMM Do')})</div>
      <ul>
        <li>Look over {/* TODO: Raymond Arnold look here, sentence fragment */} </li>
        <li>Any user registered before {REVIEW_YEAR} can vote in the review</li>
        <li>The end result will be compiled into a canonical sequence and best-of {REVIEW_YEAR} book</li>
      </ul>
      {/* TODO: Raymond Arnold look here, This isn't that useful to say any more */}
      <div> Before the vote starts, you can try out the vote process on posts nominated and reviewed in {REVIEW_YEAR-1}</div>
    </>

  const dateFraction = (fractionDate: moment.Moment, startDate: moment.Moment, endDate: moment.Moment) => {
    if (fractionDate < startDate) return 0
    return ((fractionDate.unix() - startDate.unix())/(endDate.unix() - startDate.unix())*100).toFixed(2)
  }

  const allEligiblePostsUrl = 
    isEAForum ? `/allPosts?timeframe=yearly&before=${REVIEW_YEAR+1}-01-01&limit=25&sortedBy=top&filter=unnominated&includeShortform=false`
    : `/allPosts?timeframe=yearly&after=2020-01-01&before=2021-01-01&limit=100&sortedBy=top&filter=unnominated&includeShortform=false`
  
  const reviewPostPath = annualReviewAnnouncementPostPathSetting.get()
  if (!reviewPostPath) {
    // eslint-disable-next-line no-console
    console.error("No review announcement post path set")
  }

  const allPhaseButtons = <>        
    {!showFrontpageItems && userIsAdmin(currentUser) && <LWTooltip className={classes.buttonWrapper} title={`Look at metrics related to the Review`}>
      <Link to={'/reviewAdmin'} className={classNames(classes.actionButton, classes.adminButton)}>
        Review Admin
      </Link>
    </LWTooltip>}
  </>

  return (
    <AnalyticsContext pageSectionContext="frontpageReviewWidget">
      <div>
        <SectionTitle 
          title={<LWTooltip title={overviewTooltip} placement="bottom-start">
            <Link to={"/reviewVoting"}>
              {REVIEW_NAME_TITLE}
            </Link>
          </LWTooltip>}
        >
          <LWTooltip title={overviewTooltip} className={classes.hideOnMobile}>
            <Link to={reviewPostPath || ""}>
              <SettingsButton showIcon={false} label={`How does the ${REVIEW_NAME_IN_SITU} work?`}/>
            </Link>
          </LWTooltip>
        </SectionTitle>
        <div className={classes.reviewTimeline}>
          <div className={classes.nominationBlock}>
            <LWTooltip placement="bottom-start" title={nominationsTooltip} className={classNames(classes.progress, {[classes.activeProgress]: activeRange === "NOMINATIONS"})}>
              <div className={classNames(classes.blockText, classes.blockLabel)}>Preliminary Voting</div>
              <div className={classNames(classes.blockText, classes.hideOnMobile)}>{nominationEndDate.format('MMM Do')}</div>
              {activeRange === "NOMINATIONS" && <div
                className={classes.coloredProgress}
                style={{width: `${dateFraction(currentDate, nominationStartDate, nominationEndDate)}%`}}
              />}
            </LWTooltip>
          </div>
          <div className={classes.reviewBlock}>     
            <LWTooltip placement="bottom-start" title={reviewTooltip} className={classNames(classes.progress, {[classes.activeProgress]: activeRange === "REVIEWS"})}>
              <div className={classNames(classes.blockText, classes.blockLabel)}>Reviews</div>
              <div className={classNames(classes.blockText, classes.hideOnMobile)}>{reviewEndDate.format('MMM Do')}</div>
              {activeRange === "REVIEWS" && <div className={classes.coloredProgress} style={{width: `${dateFraction(currentDate, nominationEndDate, reviewEndDate)}%`}}/>}
            </LWTooltip>   
          </div>
          <div className={classes.votingBlock}>
            <LWTooltip placement="bottom-start" title={voteTooltip} className={classNames(classes.progress, {[classes.activeProgress]: activeRange === "VOTING"})}>
              <div className={classNames(classes.blockText, classes.blockLabel)}>Final Voting</div>
              <div className={classNames(classes.blockText, classes.hideOnMobile)}>{voteEndDate.format('MMM Do')}</div>
              {activeRange === "VOTING" && <div className={classes.coloredProgress} style={{width: `${dateFraction(currentDate, reviewEndDate, voteEndDate)}%`}}/>}
            </LWTooltip>
          </div>
        </div>
        
        {/* Post list */}
        {showFrontpageItems && (activeRange === "NOMINATIONS" || !eligibleToNominate(currentUser) ) && <AnalyticsContext listContext={`frontpageReviewRecommendations`} reviewYear={`${REVIEW_YEAR}`} capturePostItemOnMount>
          {/* TODO:(Review) I think we can improve this */}
          <RecommendationsList algorithm={getReviewAlgorithm()} />
        </AnalyticsContext>}

        {showFrontpageItems && (activeRange !== "NOMINATIONS" && eligibleToNominate(currentUser) ) && <AnalyticsContext listContext={`frontpageReviewReviews`} reviewYear={`${REVIEW_YEAR}`}>
          {/* TODO:(Review) I think we can improve this */}
          <SingleLineReviewsList />
        </AnalyticsContext>}

        {/* TODO: Improve logged out user experience */}
        
        {activeRange === "NOMINATIONS" && eligibleToNominate(currentUser) && <div className={classes.actionButtonRow}>
          
          {showFrontpageItems && <LatestReview/>}

          {allPhaseButtons}

          <LWTooltip className={classes.buttonWrapper} title={`Nominate posts you previously upvoted.`}>
            <Link to={`/votesByYear/${isEAForum ? '%e2%89%a42020' : REVIEW_YEAR}`} className={classes.actionButton}>
              <span>
                <span className={classes.hideOnMobile}>Your</span> {isEAForum && '≤'}{REVIEW_YEAR} Upvotes
              </span>
            </Link>
          </LWTooltip>
          
          <LWTooltip className={classes.buttonWrapper} title={`Nominate posts ${isEAForum ? 'in or before' : 'from'} ${REVIEW_YEAR}`}>
            <Link to={allEligiblePostsUrl} className={classes.actionButton}>
              All <span className={classes.hideOnMobile}>{isEAForum ? 'Eligible' : REVIEW_YEAR}</span> Posts
            </Link>
          </LWTooltip>
          
          {showFrontpageItems && <LWTooltip className={classes.buttonWrapper} title={<div>
            <p>Reviews Dashboard</p>
            <ul>
              <li>View all posts with at least one preliminary vote.</li>
              <li>Cast additional votes, to help prioritize posts during the Review Phase.</li>
              <li>Start writing reviews.</li>
            </ul>
            </div>}>
            <Link to={"/reviewVoting/2020"} className={classes.actionButtonCTA}>
              Vote on <span className={classes.hideOnMobile}>nominated</span> posts
            </Link>
          </LWTooltip>}
        </div>}
        
        {activeRange === 'REVIEWS' && eligibleToNominate(currentUser) && <div className={classes.actionButtonRow}>
          {allPhaseButtons}
          {showFrontpageItems && <Link to={"/reviews"} className={classes.actionButtonCTA}>
            Review {REVIEW_YEAR} Posts
          </Link>}
        </div>}

        {activeRange === 'VOTING' && currentUserCanVote(currentUser) && <div className={classes.actionButtonRow}>
          {allPhaseButtons}
          {showFrontpageItems && <Link to={"/reviewVoting"} className={classes.actionButtonCTA}>
            Vote on {REVIEW_YEAR} Posts
          </Link>}
        </div>}
      </div>
    </AnalyticsContext>
  )
}

const FrontpageReviewWidgetComponent = registerComponent('FrontpageReviewWidget', FrontpageReviewWidget, {styles});

declare global {
  interface ComponentTypes {
    FrontpageReviewWidget: typeof FrontpageReviewWidgetComponent
  }
}
