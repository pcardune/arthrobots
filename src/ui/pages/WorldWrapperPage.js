/** @jsx React.DOM */
var State = require('react-router').State;
var Button = require('react-bootstrap').Button;
var Link = require('react-router').Link;
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var React = require('react');
var RouteHandler = require('react-router').RouteHandler;

var Tab = require('../Tab');
var TrackBadge = require('../TrackBadge');
var LoadingBlock = require('../LoadingBlock');

var WorldModel = require('../../models/WorldModel');
var TrackModel = require('../../models/TrackModel');

var WorldWrapperPage = React.createClass({

  mixins: [State],

  getInitialState: function() {
    return {worldModel: null};
  },

  componentDidMount: function() {
    this.loadWorld(this.getParams().worldId);
  },

  loadWorld: function(worldId) {
    if (!worldId) {
      return;
    }
    var query = new Parse.Query(WorldModel);
    this.setState({isLoading:true})
    query.get(worldId, {
      success: function(worldModel) {
        this.setState({worldModel:worldModel});
      }.bind(this),
      error: function(object, error) {
        alert("failed to load: "+error.code+" "+error.message);
      }.bind(this)
    });
  },

  handleWorldChange: function(newWorld) {
    this.setState({worldModel:newWorld});
  },

  render: function() {
    if (!this.state.worldModel) {
      return <LoadingBlock />;
    }
    return (
      <div>
        <Navbar brand={this.state.worldModel.getTitle()} fluid={true}>
          <Nav>
            <Tab to="world" params={{worldId:this.state.worldModel.id}}>Preview</Tab>
            <Tab to="world-definition-editor" params={{worldId:this.state.worldModel.id}}>Edit</Tab>
          </Nav>
        </Navbar>
        <RouteHandler world={this.state.worldModel} onWorldChange={this.handleWorldChange}/>
      </div>
    );
  }
});

module.exports = WorldWrapperPage;