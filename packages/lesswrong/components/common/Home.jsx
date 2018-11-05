import { Components, registerComponent } from 'meteor/vulcan:core';
import { getSetting } from 'meteor/vulcan:lib';
import React from 'react';
import { Link } from 'react-router';
import withUser from '../common/withUser';
import { withStyles } from '@material-ui/core/styles';
import { legacyBreakpoints } from '../../lib/modules/utils/theme';

const testCollections = [
  {
    title: "Rationality: A-Z",
    id: "dummyId",
    user: {userName: "Eliezer_Yudkowsky", displayName: "EliezerYudkowsky", slug: "eliezer_yudkowsky"},
    summary: 'A set of essays by Eliezer Yudkowsky that serve as a long-form introduction to formative ideas behind Less Wrong, the Machine Intelligence Research Institute, the Center for Applied Rationality, and substantial parts of the effective altruism community.',
    imageId: "dVXiZtw_xrmvpm.png",
    color: "#B1D4B4",
    big: true,
  },
  {
    title: "The Codex",
    id: "dummyId2",
    user: {username: "Yvain", displayName: "Scott Alexander", slug: "yvain"},
    summary: "The Codex contains essays about science, medicine, philosophy, politics, and futurism. (There’s also one post about hallucinatory cactus-people, but it’s not representative)",
    imageId: "ItFKgn4_rrr58y.png",
    color: "#88ACB8",
    big: false,
  },
  {
    title: "Harry Potter and the Methods of Rationality",
    id: "dummyId3",
    user: {userName: "Eliezer_Yudkowsky", displayName: "EliezerYudkowsky", slug: "eliezer_yudkowsky"},
    summary: "In an Alternate Universe, Petunia married a scientist. Now Rationalist!Harry enters the wizarding world armed with Enlightenment ideals and the experimental spirit.",
    imageId: "uu4fJ5R_zeefim.png",
    color: "#757AA7",
    big: false,
  }
]

const styles = theme => ({
  frontpageSequencesGridList: {
    [legacyBreakpoints.maxSmall]: {
      marginTop: 40,
    }
  }
});

const Home = (props, context) => {
  const { currentUser, router, classes } = props;
  const currentView = _.clone(router.location.query).view || (currentUser && currentUser.currentFrontpageFilter) || (currentUser ? "frontpage" : "curated");
  let recentPostsTerms = _.isEmpty(router.location.query) ? {view: currentView, limit: 10} : _.clone(router.location.query)

  recentPostsTerms.forum = true
  if (recentPostsTerms.view === "curated" && currentUser) {
    recentPostsTerms.offset = 3
  }

  const curatedPostsTerms = {view:"curated", limit:3}
  let recentPostsTitle = "Recent Posts"
  switch (recentPostsTerms.view) {
    case "frontpage":
      recentPostsTitle = "Frontpage Posts"; break;
    case "curated":
      if (currentUser) {
        recentPostsTitle = "More Curated"; break;
      } else {
        recentPostsTitle = "Curated Posts"; break;
      }
    case "community":
      recentPostsTitle = "All Posts"; break;
    default:
      return "Recent Posts";
  }

  const lat = currentUser && currentUser.mongoLocation && currentUser.mongoLocation.coordinates[1]
  const lng = currentUser && currentUser.mongoLocation && currentUser.mongoLocation.coordinates[0]
  let eventsListTerms = {
    view: 'events',
    limit: 3,
  }
  if (lat && lng) {
    eventsListTerms = {
      view: 'nearbyEvents',
      lat: lat,
      lng: lng,
      limit: 3,
    }
  }

  return (
    <div>
      <Components.HeadTags image={getSetting('siteImage')} />
      { !currentUser ?
        <Components.Section
          title="Recommended Reading"
          titleLink="/library"
          titleComponent= {<Components.SectionSubtitle>
            <Link to="/library">Sequence Library</Link>
          </Components.SectionSubtitle>}
        >
          <Components.CollectionsCardContainer>
            <Components.BigCollectionsCard collection={testCollections[0]} url={"/rationality"}/>
            <Components.CollectionsCard collection={testCollections[1]} url={"/codex"}/>
            <Components.CollectionsCard collection={testCollections[2]} url={"/hpmor"}/>
          </Components.CollectionsCardContainer>
        </Components.Section> :
        <div>
          <Components.Section
            title="Recommended Sequences"
            titleLink="/library"
            titleComponent= {<Components.SectionSubtitle to="/library">
              <Link to="/library">Sequence Library</Link>
            </Components.SectionSubtitle>}
          >
            <Components.SequencesGridWrapper
              terms={{view:"curatedSequences", limit:3}}
              showAuthor={true}
              showLoadMore={false}
              className={classes.frontpageSequencesGridList}
            />
          </Components.Section>
          <Components.Section title="Curated Content">
            <Components.PostsList terms={curatedPostsTerms} showHeader={false} showLoadMore={false}/>
          </Components.Section>
        </div>}
      <Components.Section title={recentPostsTitle}
        titleComponent= {<div className="recent-posts-title-component">
          <Components.PostsViews />
        </div>}
        subscribeLinks={<Components.SubscribeWidget view={recentPostsTerms.view} />}
      >
        <Components.PostsList terms={recentPostsTerms} showHeader={false} />
      </Components.Section>
      <Components.Section
        title="Community"
        titleLink="/community"
        titleComponent={<div>
          <Components.SectionSubtitle>
          <Link to="/community">Find Events Nearby</Link>
          </Components.SectionSubtitle>
        </div>}
      >
        <Components.PostsList
          terms={eventsListTerms}
          showLoadMore={false}
          showHeader={false} />
      </Components.Section>
      <Components.Section title="Recent Discussion" titleLink="/AllComments">
        <Components.RecentDiscussionThreadsList terms={{view: 'recentDiscussionThreadsList', limit:6}}/>
      </Components.Section>
    </div>
  )
};

registerComponent('Home', Home, withUser, withStyles(styles, {name: "Home"}));
