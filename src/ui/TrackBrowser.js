/** @jsx React.DOM */
var State = require('react-router').State;
var Button = require('react-bootstrap').Button;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Navigation = require('react-router').Navigation;
var React = require('react');

var TrackBadge = require('./TrackBadge');
var LoadingBlock = require('./LoadingBlock');

var WorldModel = require('../models/WorldModel');
var WorldStore = require('../stores/WorldStore');

var WorldList = require('./WorldList');

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

module.exports = TrackBrowser;