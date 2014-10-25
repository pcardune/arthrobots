/** @jsx React.DOM */

var ActiveState = require('react-router').ActiveState;
var Link = require('react-router').Link;
var React = require('react');

var Tab = React.createClass({

  mixins: [ActiveState],

  render: function() {
    var isActive = this.isActive(this.props.to, this.props.params, this.props.query);
    var className = isActive ? 'active' : '';
    var link = Link(this.props);
    return <li className={className}>{link}</li>;
  }

});

module.exports = Tab;