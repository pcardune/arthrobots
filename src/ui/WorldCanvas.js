var ReactDOM = require('react-dom');
var React = require('react');
import World from '../core/World'
import WorldParser from '../core/WorldParser'
var CanvasRenderer = require('../core/CanvasRenderer');

require('./WorldCanvas.css')

var WorldCanvas = React.createClass({
  getDefaultProps: function() {
    return {
      worldDefinition: ""
    };
  },

  getInitialState: function() {
    return {
      startX: 1,
      endX: 12,
      startY: 1,
      endY: 12
    }
  },

  componentWillMount: function() {
    this.world = new World();
  },

  componentDidMount: function() {
    this.renderer = new CanvasRenderer(ReactDOM.findDOMNode(this.refs.canvas), this.world);
    this.renderWorld();
  },

  renderWorld: function(worldDefinition) {
    worldDefinition = worldDefinition || this.props.worldDefinition;
    this.world = new World();
    this.renderer = new CanvasRenderer(ReactDOM.findDOMNode(this.refs.canvas), this.world);
    this.parser = new WorldParser(worldDefinition.split('\n'), this.world);
    this.parser.parse();
    this.renderer.render();
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.worldDefinition != nextProps.worldDefinition) {
      this.renderWorld(nextProps.worldDefinition);
    }
  },

  handleClick: function(event) {
    var offset = {x:0, y:0};
    var el = event.target;
    while (el) {
      offset.x += el.offsetLeft;
      offset.y += el.offsetTop;
      el = el.offsetParent;
    }
    var x = event.pageX - offset.x;
    var y = event.pageY - offset.y;
    if (x < 50 && this.renderer.startX > 1) {
      this.renderer.startX -= 1; this.renderer.endX -= 1;
    } else if (x > event.target.offsetWidth-50) {
      this.renderer.startX += 1; this.renderer.endX += 1;
    }
    if (y < 50) {
      this.renderer.startY += 1; this.renderer.endY += 1;
    } else if (y > event.target.offsetHeight-50 && this.renderer.startY > 1) {
      this.renderer.startY -= 1; this.renderer.endY -= 1;
    }
    event.preventDefault();
    this.renderer.shouldFollowRobot = false;
    this.renderer.render();
  },

  render: function() {
    if (this.props.worldDefinition && this.renderer && !this.parser) {
      this.renderWorld();
    }
    return (
      <canvas
        onMouseDown={this.handleClick}
        className={"WorldCanvas "+this.props.className}
        id="worldCanvas"
        ref="canvas"
        width="500"
        height="500"/>
    );
  }
});

module.exports = WorldCanvas;