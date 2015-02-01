/** @jsx React.DOM */
var State = require('react-router').State;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var React = require('react');
var assign = require('object-assign');

var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var LoadingBlock = require('../LoadingBlock');

var TrackModel = require('../../models/TrackModel');

var TrackBrowser = require('../TrackBrowser');

var BrowseWorldsPage = React.createClass({

  mixins: [Navigation, State, FluxMixin, StoreWatchMixin("TrackStore")],

  getInitialState: function() {
    return {
      filter: "yours"
    };
  },

  getStateFromFlux: function() {
    var store = this.getFlux().store("TrackStore");
    return {
      loadingTracks: store.isLoading(),
      loadingTracksError: store.getError(),
      trackModels: store.getAllTracks()
    };
  },

  setFilter: function(filter) {
    if (filter != this.state.filter) {
      this.setState({filter: filter});
    }
  },

  componentDidMount: function() {
    this.getFlux().actions.loadTracksAndWorlds();
  },

  render: function() {
    if (this.state.loadingTracks) {
      return <LoadingBlock />;
    }

    var trackGroups = this.state.trackModels.map(function(trackModel) {
      return <TrackBrowser track={trackModel} filter={this.state.filter} />
    }.bind(this));

    return (
      <div className="row loginPage">
        <div className="col-md-12">
          <Navbar fluid={true}>
            <Nav>
              <NavItem
                className={this.state.filter == "yours" ? "active" : null}
                onClick={this.setFilter.bind(this, 'yours')}>
                Your Worlds
              </NavItem>
              <NavItem
                className={this.state.filter == "all" ? "active" : null}
                onClick={this.setFilter.bind(this, 'all')}>
                All Worlds
              </NavItem>
            </Nav>
          </Navbar>
          {trackGroups}
        </div>
      </div>
    );
  }
});

module.exports = BrowseWorldsPage;