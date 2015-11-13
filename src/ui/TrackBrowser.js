import Parse from 'parse'
var ReactDOM = require('react-dom');
var State = require('react-router').State;
var Button = require('react-bootstrap').Button;
var Modal = require('react-bootstrap').Modal;
var Navigation = require('react-router').Navigation;
var History = require('react-router').History;
var React = require('react');

var TrackBadge = require('./TrackBadge');
var LoadingBlock = require('./LoadingBlock');
var WorldModel = require('../models/WorldModel');
var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var WorldList = require('./WorldList');

var TrackBrowser = React.createClass({

  mixins: [Navigation, History, State, FluxMixin, StoreWatchMixin("WorldStore", "UserStore")],

  getDefaultProps: function() {
    return {
      filter: "yours",
      track: {id:null}
    }
  },

  getInitialState: function() {
    return {
      showCreateWorldModal: false
    };
  },

  getStateFromFlux: function() {
    var worldStore = this.getFlux().store("WorldStore");
    var userStore = this.getFlux().store("UserStore");
    var worldModels = worldStore.getWorldsForTrack(this.props.track.id);
    var users = {};
    worldModels.forEach(function(world) {
      users[world.get('owner').id] = userStore.getUser(world.get('owner').id);
    });
    return {
      worldModels: worldModels,
      users: users
    };
  },

  componentDidMount: function() {
    this.getFlux().store("WorldStore").on("create_success", this._onNewWorld);
  },

  componentWillUnmount: function() {
    this.getFlux().store("WorldStore").removeListener("create_success", this._onNewWorld);
  },

  _onNewWorld: function(world) {
    window.setTimeout(function() {
      this.history.pushState(null, `/worlds/${world.id}`);
    }.bind(this));
  },

  handleCreateNewWorld: function() {
    this.getFlux().actions.addWorld(ReactDOM.findDOMNode(this.refs.worldNameInput).value, this.props.track.id);
  },

  openCreateWorldModal: function() {
    this.setState({showCreateWorldModal: true});
  },

  closeCreateWorldModal: function() {
    this.setState({showCreateWorldModal: false});
  },

  render: function() {
    var createWorldButton = null;
    if (!this.props.track.id || this.props.track.get('owner').id == Parse.User.current().id) {
      createWorldButton = (
        <Button bsStyle="primary" className="pull-right" onClick={this.openCreateWorldModal}>
          Create New World
        </Button>
      );
    }
    return (
      <div>
        <Modal
          title="Create World"
          animation={false}
          show={this.state.showCreateWorldModal}
          onHide={this.closeCreateWorldModal}>
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
        <h2>
          <TrackBadge track={this.props.track} />
          {createWorldButton}
        </h2>
        {this.state.worldModels ? <WorldList worlds={this.state.worldModels} users={this.state.users}/> : <LoadingBlock />}
      </div>
    );
  }
});

module.exports = TrackBrowser;