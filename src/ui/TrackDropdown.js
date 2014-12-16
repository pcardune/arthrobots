/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;
var React = require('react');

var WorldModel = require('../models/WorldModel');
var TrackModel = require('../models/TrackModel');

var TrackDropdown = React.createClass({

  getInitialState: function() {
    return {
      isLoading: true,
      trackModels: []
    }
  },

  loadTrackModels: function(filter) {
    var query = new Parse.Query(TrackModel);
    query.ascending("createdAt");
    query.find({
      success: function(trackModels) {
        this.setState({
          isLoading: false,
          trackModels: trackModels
        })
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadTrackModels();
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