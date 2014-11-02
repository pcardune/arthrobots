/** @jsx React.DOM */

var ActiveState = require('react-router').ActiveState;
var Parse = require('parse').Parse;
var React = require('react');

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;

var Tab = require('./Tab');

require('./ArthrobotApp.css')

var ArthrobotApp = React.createClass({

  mixins: [ActiveState],

  getInitialState: function() {
    return {
      user: Parse.User.current()
    };
  },

  render: function() {
    return (
      <div className="container ArthrobotApp">
        <Navbar brand="Arthrobots" fluid={true} className="navbar-inverse">
          <Nav>
            <Tab to="landing">Home</Tab>
            {Parse.User.current() ? <Tab to="worlds">Worlds</Tab> : null}
          </Nav>
          <Nav className="navbar-right">
            {this.state.user ? null : <Tab to="signup"><strong>Sign Up</strong></Tab>}
            {this.state.user ? <Tab to="logout">Logout</Tab> : <Tab to="login">Log In</Tab>}
          </Nav>
        </Navbar>

        <div className="row">
          <div className="col-md-12 app-content">
            {this.props.activeRouteHandler()}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ArthrobotApp;