import { Components, registerComponent, withDocument} from 'meteor/vulcan:core';
import React, { PureComponent } from 'react';
import Icon from '@material-ui/core/Icon';
import { FormattedMessage } from 'meteor/vulcan:i18n';
import { Posts } from '../../lib/collections/posts';
import classNames from 'classnames'
import Users from 'meteor/vulcan:users';

class ModerationGuidelinesLink extends PureComponent {
  constructor(props, context) {
    super(props);
    this.state = {
      open: false,
    }
  }

  handleClose = () => {
    this.setState({open: false})
  }

  render() {
    const { document } = this.props;
    const post = document;
    const user = document && document.user;
    const canModerate = Users.canModeratePost(user, post)
    if (post && user && (canModerate || document.frontpageDate)) {
      const moderationStyle = user.moderationStyle || "no-moderation";
      return <span>
        <a
          className={classNames(
            "comments-item-text",
            "moderation-guidelines-link",
            {[moderationStyle]: canModerate})}
          onClick={() => this.setState({open: !this.state.open})}>
          Moderation Guidelines{canModerate && <span>:
            <FormattedMessage id={"short-moderation-" + moderationStyle} />
          </span> }
          <Icon className="material-icons moderation-guidelines-link-expand">
            {this.state.open ? "expand_less" : "expand_more"}
          </Icon>
        </a>
        {this.state.open && <Components.ModerationGuidelinesContent showFrontpageGuidelines={post && post.frontpageDate} user={user} />}
      </span>
        } else {
      return null
    }
  }
}

const queryOptions = {
  collection: Posts,
  queryName: 'postsSingleQuery',
  fragmentName: 'LWPostsPage',
  enableTotal: false,
  enableCache: true,
};

registerComponent('ModerationGuidelinesLink', ModerationGuidelinesLink, [withDocument, queryOptions]);
