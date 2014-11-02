/** @jsx React.DOM */

var React = require('react');

require('./TrackBadge.css');
var TrackBadge = React.createClass({
  render: function() {
    return <span className={"TrackBadge label "+this.props.track.get('color')}>{this.props.track.get('name')}</span>
  }
});

module.exports = TrackBadge;