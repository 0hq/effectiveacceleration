import { Components, registerComponent, getSetting, Utils } from '../../lib/vulcan-lib';
import { withUpdate } from '../../lib/crud/withUpdate';
import React, { Component } from 'react';
import { withLocation } from '../../lib/routeUtil';
import withUser from '../common/withUser';
import Tooltip from '@material-ui/core/Tooltip';
import Users from '../../lib/collections/users/collection';
import { DEFAULT_LOW_KARMA_THRESHOLD, MAX_LOW_KARMA_THRESHOLD } from '../../lib/collections/posts/views'
import { getBeforeDefault, getAfterDefault, timeframeToTimeBlock } from './timeframeUtils'
import withTimezone from '../common/withTimezone';
import {AnalyticsContext} from "../../lib/analyticsEvents";

const styles = theme => ({
  timeframe: {
    padding: theme.spacing.unit,
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    }
  },
  title: {
    cursor: "pointer",
  }
});

export const timeframes = {
  allTime: 'All Time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

const timeframeToNumTimeBlocks = {
  daily: getSetting('forum.numberOfDays'),
  weekly: getSetting('forum.numberOfWeeks'),
  monthly: getSetting('forum.numberOfMonths'),
  yearly: getSetting('forum.numberOfYears'),
}

export const sortings = {
  magic: 'Magic (New & Upvoted)',
  recentComments: 'Recent Comments',
  new: 'New',
  old: 'Old',
  top: 'Top',
}

interface AllPostsPageProps extends WithUserProps, WithStylesProps, WithTimezoneProps, WithLocationProps {
  updateUser: WithUpdateFunction<UsersCollection>,
}
interface AllPostsPageState {
  showSettings: boolean,
}

class AllPostsPage extends Component<AllPostsPageProps,AllPostsPageState> {
  state: AllPostsPageState = {
    showSettings: (this.props.currentUser && this.props.currentUser.allPostsOpenSettings) || false
  };

  toggleSettings = () => {
    const { currentUser, updateUser } = this.props

    this.setState((prevState) => ({showSettings: !prevState.showSettings}), () => {
      if (currentUser) {
        updateUser({
          selector: { _id: currentUser._id},
          data: {
            allPostsOpenSettings: this.state.showSettings,
          },
        })
      }
    })
  }

  renderPostsList = ({currentTimeframe, currentFilter, currentSorting, currentShowLowKarma}) => {
    const { timezone, classes, location } = this.props
    const { query } = location
    const { showSettings } = this.state
    const {PostsTimeframeList, PostsList2} = Components

    const baseTerms = {
      karmaThreshold: query.karmaThreshold || (currentShowLowKarma ? MAX_LOW_KARMA_THRESHOLD : DEFAULT_LOW_KARMA_THRESHOLD),
      filter: currentFilter,
      sortedBy: currentSorting,
      after: query.after,
      before: query.before
    }

    if (currentTimeframe === 'allTime') {
      return <AnalyticsContext listContext={"allPostsPage"} terms={{view: 'allTime', ...baseTerms}}>
        <PostsList2
          terms={{
            ...baseTerms,
            limit: 50
          }}
          dimWhenLoading={showSettings}
        />
      </AnalyticsContext>
    }

    const numTimeBlocks = timeframeToNumTimeBlocks[currentTimeframe]
    const timeBlock = timeframeToTimeBlock[currentTimeframe]
    
    let postListParameters: any = {
      view: 'timeframe',
      ...baseTerms
    }

    if (parseInt(query.limit)) {
      postListParameters.limit = parseInt(query.limit)
    }

    return <div className={classes.timeframe}>
      <AnalyticsContext
        listContext={"allPostsPage"}
        terms={postListParameters}
        capturePostItemOnMount
      >
        <PostsTimeframeList
          timeframe={currentTimeframe}
          postListParameters={postListParameters}
          numTimeBlocks={numTimeBlocks}
          dimWhenLoading={showSettings}
          after={query.after || getAfterDefault({numTimeBlocks, timeBlock, timezone})}
          before={query.before  || getBeforeDefault({timeBlock, timezone})}
          reverse={query.reverse === "true"}
          displayShortform={query.includeShortform !== "false"}
        />
      </AnalyticsContext>
    </div>
  }

  render() {
    const { classes, currentUser } = this.props
    const { query } = this.props.location;
    const { showSettings } = this.state
    const { SingleColumnSection, SectionTitle, SettingsIcon, PostsListSettings, HeadTags } = Components

    const currentTimeframe = query.timeframe || currentUser?.allPostsTimeframe || 'daily'
    const currentSorting = query.sortedBy    || currentUser?.allPostsSorting   || 'magic'
    const currentFilter = query.filter       || currentUser?.allPostsFilter    || 'all'
    const currentShowLowKarma = (parseInt(query.karmaThreshold) === MAX_LOW_KARMA_THRESHOLD) ||
      currentUser?.allPostsShowLowKarma || false

    return (
      <React.Fragment>
        <HeadTags url={Utils.getSiteUrl() + "allPosts"} description={"All of LessWrong's posts, filtered and sorted however you want"}/>
        <AnalyticsContext pageContext="allPostsPage">
          <SingleColumnSection>
            <Tooltip title={`${showSettings ? "Hide": "Show"} options for sorting and filtering`} placement="top-end">
              <div className={classes.title} onClick={this.toggleSettings}>
                <SectionTitle title="All Posts">
                  <SettingsIcon label={`Sorted by ${ sortings[currentSorting] }`}/>
                </SectionTitle>
              </div>
            </Tooltip>
            <PostsListSettings
              hidden={!showSettings}
              currentTimeframe={currentTimeframe}
              currentSorting={currentSorting}
              currentFilter={currentFilter}
              currentShowLowKarma={currentShowLowKarma}
              persistentSettings
              showTimeframe
            />
            {this.renderPostsList({currentTimeframe, currentSorting, currentFilter, currentShowLowKarma})}
          </SingleColumnSection>
        </AnalyticsContext>
      </React.Fragment>
    )
  }
}

const AllPostsPageComponent = registerComponent(
  'AllPostsPage', AllPostsPage, {
    styles,
    hocs: [
      withLocation, withUser, withTimezone,
      withUpdate({
        collection: Users,
        fragmentName: 'UsersCurrent',
      })
    ]
  }
);

declare global {
  interface ComponentTypes {
    AllPostsPage: typeof AllPostsPageComponent
  }
}
