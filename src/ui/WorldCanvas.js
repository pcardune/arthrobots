/** @jsx React.DOM */
var React = require('react');
var World = require('../core/World');
var WorldParser = require('../core/WorldParser');
var CanvasRenderer = require('../core/CanvasRenderer');

require('./WorldCanvas.css')

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
    this.renderer = new CanvasRenderer(this.refs.canvas.getDOMNode(), this.world);
    this.renderWorld();
  },

  renderWorld: function(worldDefinition) {
    worldDefinition = worldDefinition || this.props.worldDefinition;
    this.world = new World();
    this.renderer = new CanvasRenderer(this.refs.canvas.getDOMNode(), this.world);
    this.parser = new WorldParser(worldDefinition.split('\n'), this.world);
    this.parser.parse();
    this.renderer.render();
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.worldDefinition != nextProps.worldDefinition) {
      this.renderWorld(nextProps.worldDefinition);
    }
  },

  render: function() {
    if (this.props.worldDefinition && this.renderer && !this.parser) {
      this.renderWorld();
    } else {
      console.log("not rendering world yet", this.props.worldDefinition, this.renderer, this.parser);
    }
    return <canvas className={"WorldCanvas "+this.props.className} id="worldCanvas" ref="canvas" width="500" height="500" />
  }
});

module.exports = WorldCanvas;