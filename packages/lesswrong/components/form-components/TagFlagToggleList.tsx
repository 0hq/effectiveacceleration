import React from 'react';
import PropTypes from 'prop-types';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import * as _ from 'underscore';
import { useMulti } from '../../lib/crud/withMulti';
import NoSsr from '@material-ui/core/NoSsr';

const styles = (theme: ThemeType): JssStyles => ({
  
});

const TagFlagToggleList = ({ value, path }, context) => {
  const { Loading, TagFlagItem } = Components

  const handleClick = (option) => {    
    if (value.includes(option)) {
      context.updateCurrentValues({
        [path]: _.without(value, option)
      })
    } else {
      context.updateCurrentValues({
        [path]: [...value, option]
      })
    }
  }

  const { results, loading } = useMulti({
    terms: {
      view: "allTagFlags"
    },
    collectionName: "TagFlags",
    fragmentName: 'TagFlagFragment',
    enableTotal: false,
    limit: 100,
  });

  if (loading) return <Loading />
  return <NoSsr><div className="multi-select-buttons">
    {results?.map(({_id}) => {
      const selected = value && value.includes(_id);
      return <a key={_id} onClick={() => handleClick(_id)}>
        <TagFlagItem documentId={_id} style={selected ? "grey" : "white"} showNumber={false} />
      </a>
    })}
  </div></NoSsr>
}

(TagFlagToggleList as any).contextTypes = {
  updateCurrentValues: PropTypes.func,
};

const TagFlagToggleListComponent = registerComponent("TagFlagToggleList", TagFlagToggleList, {styles});

declare global {
  interface ComponentTypes {
    TagFlagToggleList: typeof TagFlagToggleListComponent
  }
}
