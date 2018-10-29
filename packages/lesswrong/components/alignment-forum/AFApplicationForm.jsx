import React, { PureComponent } from 'react';
import { registerComponent, withMessages, Components, withUpdate } from 'meteor/vulcan:core';
import PropTypes from 'prop-types';
import withUser from '../common/withUser'
import Users from 'meteor/vulcan:users';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

class AFApplicationForm extends PureComponent {
  state = { applicationText: "" }

  handleSubmission = (event) => {
    const { currentUser, updateUser, flash, onRequestClose } = this.props
    event.preventDefault();
    updateUser({
      selector: { _id: currentUser._id },
      data: {
        afSubmittedApplication: true,
        afApplicationText: this.state.applicationText,
      }
    }).then(()=>{
      flash({messageString: "Successfully submitted application", type: "success"})
      onRequestClose()
    }).catch(/* error */);
  }

  render() {
    const { onRequestClose } = this.props
    return (
      <Dialog open={true} onClose={onRequestClose}>
        <DialogTitle>
          AI Alignment Forum Membership Application
        </DialogTitle>
        <DialogContent>
          <p>
            We accept very few new members to the AI Alignment Forum. Instead, our usual suggestion is that visitors post to LessWrong.com, a large and vibrant intellectual community with a strong interest in alignment research, along with rationality, philosophy, and a wide variety of other topics.
          </p>
          <p>
            Posts and comments on LessWrong frequently get promoted to the AI Alignment Forum, where they'll automatically be visible to contributors here. We also use LessWrong as one of the main sources of new Alignment Forum members.
          </p>
          <p>
            If you have produced technical work on AI alignment, on LessWrong or elsewhere -- e.g., papers, blog posts, or comments -- you're welcome to link to it here so we can take it into account in any future decisions to expand the ranks of the AI Alignment Forum.
          </p>
          <br/>
          <TextField
            id="comment-menu-item-delete-reason"
            label="Write application text here"
            className="comments-delete-modal-textfield"
            value={this.state.applicationText}
            onChange={e => this.setState({applicationText:e.target.value})}
            fullWidth
            multiline
            rows={4}
            rowsMax={100}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onRequestClose}>
            Cancel
          </Button>
          <Button color="primary" onClick={this.handleSubmission}>
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

const withUpdateOptions = {
  collection: Users,
  fragmentName: 'SuggestAlignmentUser',
};

registerComponent('AFApplicationForm', AFApplicationForm, withMessages, [withUpdate, withUpdateOptions], withUser);
