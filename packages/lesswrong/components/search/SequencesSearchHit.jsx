import { Components, registerComponent} from 'meteor/vulcan:core';
import { Link } from 'react-router';

import React, { PureComponent } from 'react';

const SequencesSearchHit = ({hit, clickAction}) => {
  const linkProperties = clickAction ? {onClick: () => clickAction(hit._id)} : {to: "sequences/" + hit._id};
  return <div className="search-results-sequences-item sequences-item">
      <Link {...linkProperties} className="sequence-item-title-link">
        <div className="sequences-item-body ">
          <div className="sequences-item-title">
            {hit.title}
          </div>
          <div className="sequences-item-meta">
            <div className="sequences-item-author">{hit.authorDisplayName}</div>
            <div className="sequences-item-karma">{hit.karma} points </div>
            <div className="sequences-item-created-date">
              <Components.FromNowDate date={hit.createdAt}/>
            </div>
          </div>
        </div>
      </Link>
  </div>
}

registerComponent("SequencesSearchHit", SequencesSearchHit);
