var State = require('react-router').State;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var React = require('react');

var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var LoadingBlock = require('../LoadingBlock');
var Tab = require('../Tab');

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
      trackModels: this.props.location.query.filter == "yours" ?
        store.getTracksForUser(Parse.User.current()) :
        store.getAllTracks()
    };
  },

  componentDidMount: function() {
    this.getFlux().actions.loadTracksAndWorlds();
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState(this.getStateFromFlux());
  },

  render: function() {
    if (this.state.loadingTracks) {
      return <LoadingBlock />;
    }

    var trackGroups = this.state.trackModels.map(function(trackModel) {
      return <TrackBrowser key={trackModel.id} track={trackModel} filter={this.props.location.query.filter} />
    }.bind(this));

    trackGroups.push(<TrackBrowser key="nulltrack" filter={this.props.location.query.filter} />);

    return (
      <div className="row loginPage">
        <div className="col-md-12">
          <Navbar fluid={true}>
            <Nav>
              <Tab to="/worlds" query={{filter:"yours"}}>Your Worlds</Tab>
              <Tab to="/worlds" query={{filter:"all"}}>All Worlds</Tab>
            </Nav>
          </Navbar>
          {trackGroups}
        </div>
      </div>
    );
  }
});

module.exports = BrowseWorldsPage;