const PostItem = React.createClass({
  
  propTypes: {
    post: React.PropTypes.object.isRequired, // the current comment
    currentUser: React.PropTypes.object, // the current user
  },

  renderCategories() {

    ({PostCategories} = Telescope.components);

    return this.props.post.categoriesArray ? <PostCategories categories={this.props.post.categoriesArray} /> : "";
  },

  renderCommenters() {

    ({PostCommenters} = Telescope.components);

    return this.props.post.commentersArray ? <PostCommenters commenters={this.props.post.commentersArray}/> : "";
  },

  renderActions() {
    return (
      <div className="post-actions">
        {Users.can.edit(this.props.currentUser, this.props.post) ? <a href={Posts.getEditUrl(this.props.post)} className="button button--secondary">Edit</a> : ""}
      </div>
    )
  },
  
  render() {

    const post = this.props.post;

    return (
      <div className="post-item">
        
        <h3 className="post-title"><a href={Posts.getLink(post)} target={Posts.getLinkTarget(post)}>{post.title}</a></h3>
        <p><a href={Users.getProfileUrl(post.user)}>{Users.getDisplayName(post.user)}</a>, {moment(post.postedAt).fromNow()}, {post.commentCount} comments</p>
        
        {this.renderCategories()}
        {this.renderCommenters()}
        {this.renderActions()}
      
      </div>
    )
  }
});

module.exports = PostItem;