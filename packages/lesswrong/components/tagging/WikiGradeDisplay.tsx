import React from 'react'
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { wikiGradeDefinitions } from '../../lib/collections/tags/schema';
import StarIcon from '@material-ui/icons/Star';
import { Link } from '../../lib/reactRouterWrapper';
import { forumTypeSetting } from '../../lib/instanceSettings';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    display: 'flex',
    alignItem: 'center',
    marginRight: 16
  }
})

const wikiGradeDescriptions = {
  1: "This tag has been flagged for review",
  2: "This tag is a stub, you can contribute by extending it!",
  3: "This tag is C-Class, it meets the basic requirements, but there is still a lot of room to improve this tag",
  4: "This tag is B-Class, it a great resource with a solid description and many greats posts",
  5: "This tag is A-Class, it is an outstanding resource and great example of what we want good tags on LessWrong to be like"
}

const WikiGradeDisplay = ({wikiGrade, classes}: {wikiGrade:number, classes: any}) => {
  const { LWTooltip } = Components
  if (forumTypeSetting.get() === 'EAForum' || wikiGrade === 0) return null
  return <LWTooltip title={wikiGradeDescriptions[wikiGrade]}>
    <Link className={classes.root} to={"/tag/tag-grading-scheme"}>
      <StarIcon/>{wikiGradeDefinitions[wikiGrade]}
    </Link>
  </LWTooltip>
}


const WikiGradeDisplayComponent = registerComponent("WikiGradeDisplay", WikiGradeDisplay, {styles});

declare global {
  interface ComponentTypes {
    WikiGradeDisplay: typeof WikiGradeDisplayComponent
  }
}
