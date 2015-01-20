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

var Tab = require('./Tab');
var TrackBadge = require('./TrackBadge');
var LoadingBlock = require('./LoadingBlock');

var WorldModel = require('../models/WorldModel');
var TrackModel = require('../models/TrackModel');

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

  getInitialState: function() {
    return {
      worldModels: null,
    };
  },

  loadWorldModels: function(filter) {
    var query = new Parse.Query(WorldModel);
    query.equalTo("track", this.props.track);
    if (filter == "yours") {
      query.equalTo("owner", Parse.User.current());
    }
    if (filter == "all") {
      query.equalTo("public", true);
    }
    query.ascending("order");
    query.include("owner");
    query.include("track");
    query.find({
      success: function(worldModels) {
        this.setState({
          worldModels: worldModels
        })
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadWorldModels(this.props.filter);
  },

  handleCreateNewWorld: function() {
    var world = new WorldModel();
    world.set('owner', Parse.User.current());
    world.set('name', this.refs.worldNameInput.getDOMNode().value);
    world.set('track', this.props.track);
    world.save(null, {
      success: function(world) {
        // Execute any logic that should take place after the object is saved.
        this.transitionTo('world', {worldId: world.id})
      }.bind(this),
      error: function(world, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        alert('Failed to create new world, with error code: ' + error.message);
      }.bind(this)
    });
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