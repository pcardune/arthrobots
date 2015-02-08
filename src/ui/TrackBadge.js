/** @jsx React.DOM */

var React = require('react');

require('./TrackBadge.css');
var TrackBadge = React.createClass({
  getDefaultProps: function() {
    return {
      track: {id: null}
    }
  },

  render: function() {
    if (this.props.track.id) {
      return <span className={"TrackBadge label "+this.props.track.get('color')}>{this.props.track.get('name')}</span>
    }
    return <span className="TrackBadge label">No Track</span>;
  }
});

module.exports = TrackBadge;