/** @jsx React.DOM */
var Link = require('react-router').Link;
var ListGroup = require('react-bootstrap').ListGroup;
var React = require('react');

var WorldList = React.createClass({
  getDefaultProps: function() {
    return {
      worlds: [],
      users: {}
    };
  },

  render: function() {
    var worldLinks = this.props.worlds.map(function(worldModel) {
      user = this.props.users[worldModel.get('owner').id];
      return (
        <Link key={worldModel.id} className="list-group-item" to="world" params={{worldId:worldModel.id}}>
          <h4>
            {worldModel.getTitle()} by {user ? user.get('username') : null}
          </h4>
          <p>{(worldModel.get('description') || '').slice(0,100)}...</p>
        </Link>
      );
    }.bind(this));
    return <ListGroup>{worldLinks}</ListGroup>;
  }
});

module.exports = WorldList;