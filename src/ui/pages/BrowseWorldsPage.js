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

var Tab = require('../Tab');
var TrackBadge = require('../TrackBadge');
var LoadingBlock = require('../LoadingBlock');

var WorldModel = require('../../models/WorldModel');
var TrackModel = require('../../models/TrackModel');
var WorldStore = require('../../stores/WorldStore');
var ViewActionCreators = require('../../actions/ViewActionCreators');

var WorldList = React.createClass({
  render: function() {
    var worldLinks = this.props.worlds.map(function(worldModel) {
      return (
        <Link key={worldModel.id} className="list-group-item" to="world" params={{worldId:worldModel.id}}>
          <h4>
            {worldModel.getTitle()} by {worldModel.get('owner').get('username')}
          </h4>
          <p>{(worldModel.get('description') || '').slice(0,100)}...</p>
        </Link>
      );
    });
    return <ListGroup>{worldLinks}</ListGroup>;
  }
});

var TrackBrowser = React.createClass({

  mixins: [Navigation, State],

  getDefaultProps: function() {
    return {
      filter: "yours",
      track: null
    }
  },

  _getStateFromStores: function() {
    return {worldModels:WorldStore.getWorldsForTrack(this.props.track.id)}
  },

  getInitialState: function() {
    return this._getStateFromStores();
  },

  componentDidMount: function() {
    WorldModel.fetchWorldsForTrack(this.props.track);
    WorldStore.addChangeListener(this._onChange);
    WorldStore.addNewWorldListener(this._onNewWorld);
  },

  componentWillUnmount: function() {
    WorldStore.removeChangeListener(this._onChange);
    WorldStore.removeNewWorldListener(this._onNewWorld);
  },

  _onNewWorld: function(world) {
    this.transitionTo('world', {worldId: world.id});
  },

  _onChange: function() {
    this.setState(this._getStateFromStores());
  },

  handleCreateNewWorld: function() {
    var world = new WorldModel();
    world.set('owner', Parse.User.current());
    world.set('name', this.refs.worldNameInput.getDOMNode().value);
    world.set('track', this.props.track);
    WorldModel.createNewWorld(world);
  },

  render: function() {
    var createWorldModal = (
      <Modal title="Create World" animation={false}>
        <div className="modal-body">
          <div className="form-group">
            <label>World Name</label>
            <input ref="worldNameInput" type="text" className="form-control" placeholder="World Name" />
          </div>
          <div className="form-group">
            <label>Track</label>
            <div><TrackBadge track={this.props.track}/></div>
          </div>
          <div className="modal-footer">
            <Button onClick={this.handleCreateNewWorld} bsStyle="primary">Create World</Button>
          </div>
        </div>
      </Modal>
    );
    return (
      <div>
        <h2>
          <TrackBadge track={this.props.track} />
          <ModalTrigger modal={createWorldModal}>
            <Button bsStyle="primary" className="pull-right">Create New World</Button>
          </ModalTrigger>
        </h2>
        {this.state.worldModels ? <WorldList worlds={this.state.worldModels} /> : <LoadingBlock />}
      </div>
    );
  }
});

var BrowseWorldsPage = React.createClass({

  mixins: [Navigation, State],

  getInitialState: function() {
    return {
      trackModels: null,
      filter: "yours"
    };
  },

  loadTrackModels: function(filter) {
    var query = new Parse.Query(TrackModel);
    if (filter == "yours") {
      query.equalTo("owner", Parse.User.current());
    }
    query.ascending("name");
    query.include("owner");
    query.find({
      success: function(trackModels) {
        this.setState({trackModels: trackModels});
      }.bind(this)
    });
  },

  isLoading: function() {
    return !this.state.trackModels;
  },

  setFilter: function(filter) {
    if (filter != this.state.filter) {
      this.setState({filter: filter});
    }
  },

  componentDidMount: function() {
    this.loadTrackModels(this.state.filter);
  },

  componentWillUpdate: function(nextProps, nextState) {
    if (this.state.filter != nextState.filter) {
      this.loadTrackModels(nextState.filter);
    }
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