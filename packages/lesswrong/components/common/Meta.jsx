import { Components, registerComponent, withCurrentUser} from 'meteor/vulcan:core';
import React from 'react';
import { Link } from 'react-router';

const Meta = (props, context) => {
  const query = props.location && props.location.query;
  const recentPostsTerms = {view: 'top', limit: 5, ...query, meta: true}
  const featuredPostsTerms = {view: 'featured', limit: 3, meta: true};
  return (
    <div className="home">
        <Components.Section title="Featured Meta Posts">
          <Components.PostsList terms={featuredPostsTerms} showHeader={false} showLoadMore={false} />
        </Components.Section>
        <Components.Section title="Recent Meta Posts"
          titleComponent= {<div className="recent-posts-title-component">
            sorted by<br /> <Components.PostsViews />
          {props.currentUser && <div className="new-post-link"><Link to={{pathname:"/newPost", query: {meta: true}}}> new post </Link></div>}
          </div>} >
          <Components.PostsList terms={recentPostsTerms} showHeader={false} />
        </Components.Section>
    </div>
  )
};

registerComponent('Meta', Meta, withCurrentUser);
