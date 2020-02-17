import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';

const styles = theme => ({
  column: {
    maxWidth:680,
    margin:"auto"
  }
})

const ShortformPage = ({classes}) => {
  const { SingleColumnSection, ShortformThreadList, SectionTitle } = Components

  return (
    <SingleColumnSection>
      <div className={classes.column}>
        <SectionTitle title="Shortform Content [Beta]"/>
        <ShortformThreadList terms={{view: 'shortform', limit:20}} />
      </div>
    </SingleColumnSection>
  )
}

const ShortformPageComponent = registerComponent('ShortformPage', ShortformPage, {styles});

declare global {
  interface ComponentTypes {
    ShortformPage: typeof ShortformPageComponent
  }
}

