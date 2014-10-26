/** @jsx React.DOM */
var React = require('react');
var World = require('../core/World');
var WorldParser = require('../core/WorldParser');
var CanvasRenderer = require('../core/CanvasRenderer');

var WorldCanvas = React.createClass({
  getDefaultProps: function() {
    return {
      worldDefinition: ""
    };
  },

  componentWillMount: function() {
    this.world = new World();
  },

  componentDidMount: function() {
    this.renderer = new CanvasRenderer('worldCanvas', this.world);
    this.renderWorld();
  },

  renderWorld: function() {
    console.log("rendering World");
    var parser = new WorldParser(this.props.worldDefinition.split('\n'), this.world);
    parser.parse();
    this.renderer.render();
  },

  render: function() {
    if (this.props.worldDefinition && this.renderer) {
      this.renderWorld();
    }
    return <canvas id="worldCanvas" ref="canvas" width="500" height="500" />
  }
});

module.exports = WorldCanvas;