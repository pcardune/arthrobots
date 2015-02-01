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
var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var WorldList = require('./WorldList');

var TrackBrowser = React.createClass({

  mixins: [Navigation, State, FluxMixin, StoreWatchMixin("WorldStore")],

  getDefaultProps: function() {
    return {
      filter: "yours",
      track: null
    }
  },

  getStateFromFlux: function() {
    var store = this.getFlux().store("WorldStore");
    return {
      worldModels:store.getWorldsForTrack(this.props.track.id)
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
      this.transitionTo('world', {worldId: world.id});
    }.bind(this));
  },

  handleCreateNewWorld: function() {
    this.getFlux().actions.addWorld(this.refs.worldNameInput.getDOMNode().value, this.props.track.id);
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