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
var WorldStore = require('../../stores/WorldStore');
var TrackModel = require('../../models/TrackModel');

var WorldWrapperPage = React.createClass({

  mixins: [State],

  _getStateFromStores: function() {
    return {
      worldModel:WorldStore.getWorld(this.getParams().worldId)
    };
  },

  getInitialState: function() {
    return this._getStateFromStores();
  },

  componentDidMount: function() {
    WorldStore.addChangeListener(this._onChange);
    WorldModel.fetchWorld(this.getParams().worldId);
  },

  componentWillUnmount: function() {
    WorldStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this._getStateFromStores());
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
            <Tab to="world-details-editor" params={{worldId:this.state.worldModel.id}}>Edit Details</Tab>
            <Tab to="world-definition-editor" params={{worldId:this.state.worldModel.id}}>Edit World</Tab>
          </Nav>
        </Navbar>
        <RouteHandler world={this.state.worldModel}/>
      </div>
    );
  }
});

module.exports = WorldWrapperPage;