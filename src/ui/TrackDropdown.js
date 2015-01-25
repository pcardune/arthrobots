/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;
var React = require('react');

var WorldModel = require('../models/WorldModel');
var TrackModel = require('../models/TrackModel');
var TrackStore = require('../stores/TrackStore');

var getStateFromStores = function() {
  return {trackModels:TrackStore.getAllTracks()};
};

var TrackDropdown = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
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