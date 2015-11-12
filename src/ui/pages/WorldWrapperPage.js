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
var NavBrand = require('react-bootstrap').NavBrand;
var Navigation = require('react-router').Navigation;
var React = require('react');
var RouteHandler = require('react-router').RouteHandler;
var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var Tab = require('../Tab');
var TrackBadge = require('../TrackBadge');
var LoadingBlock = require('../LoadingBlock');

var WorldModel = require('../../models/WorldModel');
var WorldStore = require('../../stores/WorldStore');
var TrackModel = require('../../models/TrackModel');

var WorldWrapperPage = React.createClass({

  mixins: [State, FluxMixin, StoreWatchMixin("WorldStore")],

  getStateFromFlux: function() {
    var store = this.getFlux().store("WorldStore");
    return {
      worldModel: store.getWorld(this.props.params.worldId)
    };
  },

  componentDidMount: function() {
    this.getFlux().actions.loadWorld(this.props.params.worldId);
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
        <Navbar fluid={true}>
          <NavBrand>{this.state.worldModel.getTitle()}</NavBrand>
          <Nav>
            <Tab to={`/worlds/${this.state.worldModel.id}`}>Preview</Tab>
            <Tab to={`/worlds/${this.state.worldModel.id}/details`}>Edit Details</Tab>
            <Tab to={`/worlds/${this.state.worldModel.id}/builder`}>Edit World</Tab>
          </Nav>
        </Navbar>
        {React.cloneElement(this.props.children, {world: this.state.worldModel})}
      </div>
    );
  }
});

module.exports = WorldWrapperPage;