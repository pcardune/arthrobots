
var Link = require('react-router').Link;
var RouteHandler = require('react-router').RouteHandler;
var React = require('react');
var gravatar = require('gravatar');

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var NavBrand = require('react-bootstrap').NavBrand;

var FBUtils = require('../FBUtils');

var Tab = require('./Tab');

require('./ArthrobotApp.css');

var ArthrobotApp = React.createClass({

  render: function() {
    var navbar = [];
    var user = Parse.User.current();
    var anonUserNotice = null;
    if (user) {
      if (!user.get('email') && !user.get('authData')) {
        anonUserNotice = (
          <div className="text-center alert alert-danger">
          You are logged in anonymously! <Link to="/signup" query={{next:window.location.pathname+window.location.search}} className="btn btn-primary">Create an Account</Link> to save your progress.
          </div>
        );
      }
      navbar = [
        <Link key="1" to="/profile" params={{userId:user.id}}><img className="gravatar" src={FBUtils.getProfilePic(user)} /></Link>,
        <Tab key="2" to="/logout">Logout</Tab>
      ];
    } else {
      navbar = [
        <Tab key="1" to="/signup" query={{next:window.location.pathname+window.location.search}}><strong>Sign Up</strong></Tab>,
        <Tab key="2" to="/login" query={{next:window.location.pathname+window.location.search}}>Log In</Tab>
      ];
    }
    return (
      <div className="container ArthrobotApp">
        {anonUserNotice}
        <Navbar fluid={true} className="navbar-inverse">
          <NavBrand><Link to="/">Arthrobots</Link></NavBrand>
          <Nav>
            <Tab to="/">Home</Tab>
            <Tab to="/leaderboard">Leaderboard</Tab>
            <Tab to="/about">About</Tab>
          </Nav>
          <Nav className="navbar-right">
            {navbar}
          </Nav>
        </Navbar>

        <div className="row">
          <div className="col-md-12 app-content">
            {this.props.children}
          </div>
        </div>
        <div className="row footer">
          <div className="col-md-12">
            Created by <a href="http://github.com/pcardune" target="_blank">pcardune</a>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ArthrobotApp;