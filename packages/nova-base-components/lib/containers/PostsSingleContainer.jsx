import Telescope from 'meteor/nova:lib';
import React, { PropTypes, Component } from 'react';
import Posts from "meteor/nova:posts";

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class PostsSingleContainer extends Component {

  getChildContext() {
    return {
      refetchPostsSingleQuery: this.props.data.refetch
    };
  }

  render() {

    console.log(this.props)
    
    const {loading, post, refetch} = this.props.data;
    const Component = this.props.component

    return loading ? <Telescope.components.Loading/> : <Component 
      document={post}
      refetchQuery={refetch}
      {...this.props.componentProps}
    />;
  }
};

PostsSingleContainer.propTypes = {
  data: React.PropTypes.shape({
    loading: React.PropTypes.bool,
    post: React.PropTypes.object,
  }).isRequired,
  params: React.PropTypes.object
};

PostsSingleContainer.childContextTypes = {
  refetchPostsSingleQuery: React.PropTypes.func
};

PostsSingleContainer.contextTypes = {
  currentUser: React.PropTypes.object
};

PostsSingleContainer.displayName = "PostsSingleContainer";

// this query is really too big 💥...🚂
const PostsSingleContainerWithData = graphql(gql`
  query getPost($postId: String) {
    post(_id: $postId) {
      ${Posts.graphQLQueries.single}
    }
  }

`, {
  options(ownProps) {
    return {
      variables: { postId: ownProps.postId },
      // pollInterval: 20000,
    };
  },
})(PostsSingleContainer);

module.exports = PostsSingleContainerWithData;