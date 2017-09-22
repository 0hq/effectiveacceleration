import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withCurrentUser, Components, replaceComponent } from 'meteor/vulcan:core';
import { withRouter } from 'react-router';
import { Link } from 'react-router';
import NoSSR from 'react-no-ssr';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

const appBarStyle = {
  boxShadow: "none",
}

const appBarTitleStyle = {
  paddingTop: '2px',
  fontSize: '19px',
  cursor: 'pointer',
  flex: 'none',
}

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleToggle = () => this.setState({open: !this.state.open});

  handleClose = () => this.setState({open: false});

  renderAppBarElementRight = () => {
  const notificationTerms = {view: 'userNotifications', userId: (!!this.props.currentUser ? this.props.currentUser._id : "0")};
  return <div>
    <NoSSR><Components.SearchBar /></NoSSR>
    {this.props.currentUser ? <Components.NotificationsMenu title="Notifications" terms={notificationTerms}/> : null}
    {this.props.currentUser ? <Components.UsersMenu /> : <Components.UsersAccountMenu />}
  </div>}

  render() {
    //TODO: Improve the aesthetics of the menu bar. Add something at the top to have some reasonable spacing.


    let { router } = this.props;
    return (
      <div className="header-wrapper">
        <header className="header">
          <AppBar
            title="LESSWRONG"
            onLeftIconButtonTouchTap={this.handleToggle}
            onTitleTouchTap={() => router.push("/")}
            iconElementRight = {this.renderAppBarElementRight()}
            style={appBarStyle}
            titleStyle={appBarTitleStyle}
          />
        <Drawer docked={false} width={200} open={this.state.open} onRequestChange={(open) => this.setState({open})} containerClassName="menu-drawer" >
          <MenuItem onTouchTap={this.handleClose} containerElement={<Link to={"/"}/>}> HOME </MenuItem>
          <MenuItem onTouchTap={this.handleClose} containerElement={<Link to={"/sequences"}/>}> RATIONALITY:A-Z </MenuItem>
          <MenuItem onTouchTap={this.handleClose} containerElement={<Link to={"/codex"}/>}> THE CODEX </MenuItem>
          <MenuItem onTouchTap={this.handleClose} containerElement={<Link to={"/hpmor"}/>}> HPMOR </MenuItem>
          <MenuItem onTouchTap={this.handleClose} containerElement={<Link to={"/meta"}/>}> META </MenuItem>
          <MenuItem onTouchTap={this.handleClose} containerElement={<Link to={"/posts/ANDbEKqbdDuBCQAnM/about-lesswrong-2-0"}/>}> ABOUT </MenuItem>
          <MenuItem onTouchTap={this.handleClose} containerElement={<Link to={"/AllPosts"}/>}> ALL POSTS </MenuItem>
          {/*<MenuItem containerElement={<Link to={"/library"}/>}> THE LIBRARY </MenuItem>*/}
        </Drawer>
        </header>
      </div>
    )
  }

}

Header.displayName = "Header";

Header.propTypes = {
  currentUser: PropTypes.object,
};

replaceComponent('Header', Header, withRouter);
