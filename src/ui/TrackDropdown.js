/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;
var React = require('react');
var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var getStateFromStores = function() {
  return {trackModels:TrackStore.getAllTracks()};
};

var TrackDropdown = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("TrackStore")],

  getStateFromFlux: function() {
    var store = this.getFlux().store("TrackStore");
    return {
      trackModels: store.getAllTracks()
    };
  },

  componentDidMount: function() {
    window.setTimeout(function() {
      this.getFlux().actions.loadTracks();
    }.bind(this));
  },

  getValue: function() {
    var id = this.refs.input.getValue();
    for (var i = 0; i < this.state.trackModels.length; i++) {
      if (this.state.trackModels[i].id == id) {
        return this.state.trackModels[i];
      }
    }
    return null;
  },

  render: function() {
    return (
      <Input {...this.props} type="select" ref="input" value={this.props.defaultValue && this.props.defaultValue.id}>
        <option value=""></option>
        {this.state.trackModels.map(function(track) {return <option key={track.id} value={track.id}>{track.get('name')}</option>;})}
      </Input>
    );
  }
});

module.exports = TrackDropdown;