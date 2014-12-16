/** @jsx React.DOM */
var Button = require('react-bootstrap').Button
var React = require('react');
var CodeEditor = require('../ui/CodeEditor');

var AIWorldCanvas = require('./AIWorldCanvas');

var AIWorld = require('../aicore/AIWorld');
var AIRobot = require('../aicore/AIRobot');
var AISimulator = require('../aicore/AISimulator');
var AICanvasRenderer = require('../aicore/AICanvasRenderer');

var AILandingPage = React.createClass({

  componentWillMount: function() {
    this.world = new AIWorld();
  },

  componentDidMount: function() {
    this.renderer = new AICanvasRenderer(this.refs.canvas.getDOMNode(), this.world)
    this.robot = new AIRobot();
    this.robot.x = 250;
    this.robot.y = 250;
    this.world.addRobot(this.robot);
    this.renderer.render();
  },

  handleRun: function() {
    this.simulator = new AISimulator(this.world, this.renderer);
    var code = this.refs.editor.getDOMNode().value;

    js = 'var CustomRobot = AIRobot.extend('+code+');'
    eval(js);
    robot = new CustomRobot();
    robot.x = 250;
    robot.y = 250;
    this.world.replaceRobot(this.robot, robot);
    this.robot = robot;

    this.simulator.run();
  },

  render: function() {
    return (
      <div className="row">
        <div className="col-md-6">
          <CodeEditor ref="editor" />
          <Button onClick={this.handleRun}>Run</Button>
        </div>
        <div className="col-md-6">
          <AIWorldCanvas ref="canvas" />
        </div>
      </div>
    );
  }
});

module.exports = AILandingPage;