/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Navigation = require('react-router').Navigation;
var Nav = require('react-bootstrap').Nav;
var Navbar = require('react-bootstrap').Navbar;
var Parse = require('parse').Parse;
var React = require('react');

var Tab = require('./Tab');

var WorldModel = require('../models/WorldModel');

var BrowseWorldPage = React.createClass({

  mixins: [Navigation],

  handleCreateNewWorld: function() {
    var world = new WorldModel();
    world.set('owner', Parse.User.current());
    world.save(null, {
      success: function(gameScore) {
        // Execute any logic that should take place after the object is saved.
        alert('New object created with objectId: ' + gameScore.id);
      },
      error: function(gameScore, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        alert('Failed to create new world, with error code: ' + error.message);
      }
    });
  },

  render: function() {
    return (
      <div className="row loginPage">
        <div className="col-md-12">
          <Navbar fluid={true}>
            <Nav>
              <Tab to="landing">Your Worlds</Tab>
              <Tab to="landing">All Worlds</Tab>
            </Nav>
          </Navbar>
          <Button onClick={this.handleCreateNewWorld} bsStyle="primary">Create New World</Button>
        </div>
      </div>
    );
  }
});

module.exports = BrowseWorldPage;