/** @jsx React.DOM */

var Link = require('react-router').Link;
var RouteHandler = require('react-router').RouteHandler;
var Parse = require('parse').Parse;
var React = require('react');
var gravatar = require('gravatar');

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;

var Tab = require('./Tab');

require('./ArthrobotApp.css')

var ArthrobotApp = React.createClass({

  getInitialState: function() {
    return {
      isAdministrator: false
    }
  },

  loadIsAdministrator: function() {
    if (!Parse.User.current()) {
      return;
    }
    var roleQuery = new Parse.Query(Parse.Role);
    roleQuery.equalTo('name', 'Administrator');
    roleQuery.find({
      success: function(roles) {
        if (roles.length > 0) {
          roles[0].getUsers().query().find({
            success: function(users) {
              for (var i = 0; i < users.length; i++) {
                if (users[i].id == Parse.User.current().id) {
                  this.setState({isAdministrator:true});
                  break;
                }
              }
            }.bind(this)
          });
        }
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadIsAdministrator();
  },

  render: function() {
    var navbar = [];
    var user = Parse.User.current();
    if (user) {
      navbar = [
        <Link key="1" to="profile" params={{username:user.get('username')}}><img className="gravatar" src={gravatar.url(user.get('email'))} /></Link>,
        <Tab key="2" to="logout">Logout</Tab>
      ];
    } else {
      navbar = [
        <Tab key="1" to="signup"><strong>Sign Up</strong></Tab>,
        <Tab key="2" to="login">Log In</Tab>
      ];
    }
    var brand = <Link to="landing">Arthrobots</Link>;
    return (
      <div className="container ArthrobotApp">
        <Navbar brand={brand} fluid={true} className="navbar-inverse">
          <Nav>
            <Tab to="landing">Home</Tab>
            {this.state.isAdministrator ? <Tab to="worlds">Worlds</Tab> : null}
          </Nav>
          <Nav className="navbar-right">
            {navbar}
          </Nav>
        </Navbar>

        <div className="row">
          <div className="col-md-12 app-content">
            <RouteHandler/>
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