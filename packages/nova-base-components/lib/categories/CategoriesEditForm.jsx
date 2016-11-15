import Telescope from 'meteor/nova:lib';
import React, { PropTypes, Component } from 'react';
import { FormattedMessage } from 'react-intl';
import NovaForm from "meteor/nova:forms";
import Categories from "meteor/nova:categories";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class CategoriesEditForm extends Component{

  render() {

    return (
      <div className="categories-edit-form">
        <NovaForm 
          document={this.props.category}
          collection={Categories}
          mutationName="categoriesEdit"
          fragment={Categories.fragments.full}
          successCallback={(category)=>{
            this.context.closeCallback();
            this.props.flash("Category edited.", "success");
          }}
          removeSuccessCallback={({documentId, documentTitle}) => {
            this.context.closeCallback();
            const deleteDocumentSuccess = this.context.intl.formatMessage({id: 'categories.delete_success'}, {title: documentTitle});
            this.props.flash(deleteDocumentSuccess, "success");
            this.context.events.track("category deleted", {_id: documentId});
          }}
        />
      </div>
    )
  }
}

CategoriesEditForm.propTypes = {
  category: React.PropTypes.object.isRequired
}

CategoriesEditForm.contextTypes = {
  closeCallback: React.PropTypes.func,
};

const mapStateToProps = state => ({ messages: state.messages, });
const mapDispatchToProps = dispatch => bindActionCreators(Telescope.actions.messages, dispatch);

module.exports = connect(mapStateToProps, mapDispatchToProps)(CategoriesEditForm);
export default connect(mapStateToProps, mapDispatchToProps)(CategoriesEditForm);