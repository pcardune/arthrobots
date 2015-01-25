/** @jsx React.DOM */
var Link = require('react-router').Link;
var ListGroup = require('react-bootstrap').ListGroup;
var React = require('react');

var WorldList = React.createClass({
  render: function() {
    var worldLinks = this.props.worlds.map(function(worldModel) {
      return (
        <Link key={worldModel.id} className="list-group-item" to="world" params={{worldId:worldModel.id}}>
          <h4>
            {worldModel.getTitle()} by {worldModel.get('owner').get('username')}
          </h4>
          <p>{(worldModel.get('description') || '').slice(0,100)}...</p>
        </Link>
      );
    });
    return <ListGroup>{worldLinks}</ListGroup>;
  }
});

module.exports = WorldList;