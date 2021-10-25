import React from 'react';
import { forumTypeSetting } from '../../lib/instanceSettings';
import { Components, registerComponent } from '../../lib/vulcan-lib';

const styles = (theme: ThemeType): JssStyles => ({
  razLargeVersion: {
    [theme.breakpoints.down('xs')]: {
      display: "none",
    },
  },
  razSmallVersion: {
    [theme.breakpoints.up('sm')]: {
      display: "none",
    },
  },
});

export interface CoreReadingCollection {
  title: string,
  id: string,
  userId: string,
  summary: string,
  imageId: string,
  color: string,
  big: boolean,
  url: string,
}

const isEAForum = forumTypeSetting.get() === 'EAForum'

const coreReadingCollections: Array<CoreReadingCollection> = isEAForum ?
  [
    {
      title: "The EA Handbook",
      id: "handbook",
      userId: "jd3Bs7YAT2KqnLxYD",
      summary: "To help you learn the basics of Effective Altruism, we took some of the best writing and made this handbook. Think of it as the textbook you’d get in your first college course. It explains the core ideas of EA, so that you can start applying them to your own life.",
      imageId: "Banner/qnsx7lpxxfpf7tqxmnql",
      color: "#0c869b",
      big: true,
      url: '/handbook'
    },
    {
      title: "Replacing Guilt",
      id: "replacing-guilt",
      userId: "QNsCYAaKRdXZWKPmE",
      summary: "Nate Soares writes about replacing guilt with other feelings, exercising self-compassion, and developing confidence — so that we can create a better world.",
      imageId: "Banner/qnjqqba8qclypnkvdkqn",
      color: "#d0c9d5",
      big: false,
      url: '/s/a2LBRPLhvwB83DSGq'
    },
    {
      title: "Most Important Century",
      id: "most-important",
      userId: "9Fg4woeMPHoGa6kDA",
      summary: `Holdon Karnofsky argues that there's a good chance of a productivity explosion by 2100, which could quickly lead to a "technologically mature" civilization.`,
      imageId: "twitter-img-for-mic-nutshell-2",
      color: "#eb598e",
      big: false,
      url: '/posts/TwQzyP3QgttmuTHym/all-possible-views-about-humanity-s-future-are-wild',
    }
  ] :
  [
    {
      title: "Rationality: A-Z",
      id: "dummyId",
      userId: "nmk3nLpQE89dMRzzN",
      summary: 'A set of essays by Eliezer Yudkowsky that serve as a long-form introduction to formative ideas behind Less Wrong, the Machine Intelligence Research Institute, the Center for Applied Rationality, and substantial parts of the effective altruism community.',
      imageId: "dVXiZtw_xrmvpm.png",
      color: "#B1D4B4",
      big: true,
      url: '"/rationality"',
    },
    {
      title: "The Codex",
      id: "dummyId2",
      userId: "XgYW5s8njaYrtyP7q",
      summary: "The Codex contains essays about science, medicine, philosophy, politics, and futurism. (There’s also one post about hallucinatory cactus-people, but it’s not representative)",
      imageId: "ItFKgn4_rrr58y.png",
      color: "#88ACB8",
      big: false,
      url: "/codex",
    },
    {
      title: "Harry Potter and the Methods of Rationality",
      id: "dummyId3",
      userId: "nmk3nLpQE89dMRzzN",
      summary: "What if Harry Potter was a scientist? What would you do if the universe had magic in it? A story that illustrates many rationality concepts.",
      imageId: "uu4fJ5R_zeefim.png",
      color: "#757AA7",
      big: false,
      url: "/hpmor",
    }
  ]

const CoreReading = ({minimal=false, classes}: {
  minimal?: boolean,
  classes: ClassesType,
}) => (
  <Components.CollectionsCardContainer>
    <div className={classes.razLargeVersion}>
      <Components.BigCollectionsCard collection={coreReadingCollections[0]} url={coreReadingCollections[0].url}/>
    </div>
    <div className={classes.razSmallVersion}>
      <Components.CollectionsCard collection={coreReadingCollections[0]} url={coreReadingCollections[0].url}/>
    </div>
    
    {!minimal && <Components.CollectionsCard collection={coreReadingCollections[1]} url={coreReadingCollections[1].url}/>}
    {!minimal && <Components.CollectionsCard collection={coreReadingCollections[2]} url={coreReadingCollections[2].url} mergeTitle={!isEAForum} />}
  </Components.CollectionsCardContainer>
);

const CoreReadingComponent = registerComponent("CoreReading", CoreReading, {styles});

declare global {
  interface ComponentTypes {
    CoreReading: typeof CoreReadingComponent
  }
}
