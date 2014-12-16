/** @jsx React.DOM */
var React = require('react');

var AIWorld = require('../aicore/AIWorld');
var AIRobot = require('../aicore/AIRobot');
var AISimulator = require('../aicore/AISimulator');

var AIWorldCanvas = React.createClass({
  getDefaultProperties: function() {
    return {
      world: null
    }
  },

  render: function() {
    return (
      <canvas width="500" height="500" style={{border:"1px solid black"}}/>
    );
  }
});

module.exports = AIWorldCanvas;