/** @jsx React.DOM */
var State = require('react-router').State;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var React = require('react');
var assign = require('object-assign');

var LoadingBlock = require('../LoadingBlock');

var TrackModel = require('../../models/TrackModel');
var TrackStore = require('../../stores/TrackStore');

var TrackBrowser = require('../TrackBrowser');

var getStateFromStores = function() {
  return {trackModels:TrackStore.getAllTracks()};
};

var BrowseWorldsPage = React.createClass({

  mixins: [Navigation, State],

  getInitialState: function() {
    return assign(getStateFromStores(), {
      filter: "yours"
    });
  },

  isLoading: function() {
    return !this.state.trackModels.length;
  },

  setFilter: function(filter) {
    if (filter != this.state.filter) {
      this.setState({filter: filter});
    }
  },

  componentDidMount: function() {
    TrackStore.addChangeListener(this._onChange);
    TrackModel.fetchTracks();
  },

  componentWillUnmount: function() {
    TrackStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(getStateFromStores());
  },

  render: function() {
    if (this.isLoading()) {
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