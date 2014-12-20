/** @jsx React.DOM */
var Button = require('react-bootstrap').Button
var React = require('react');
var CodeEditor = require('../ui/CodeEditor');
var Phaser = require('phaser');
var AIWorldCanvas = require('./AIWorldCanvas');
var AIGame = require('./AIGame');

var AIWorld = require('../aicore/AIWorld');
var AIRobot = require('../aicore/AIRobot');
var AISimulator = require('../aicore/AISimulator');
var AICanvasRenderer = require('../aicore/AICanvasRenderer');

var AILandingPage = React.createClass({

  getInitialState: function() {
    return {
      code: '{\n' +
        'run: function() {\n' +
        '  this.move();\n' +
        '  this.turn(1);\n' +
        '}\n' +
      '}'
    };
  },

  componentDidMount: function() {
    // this.world = new AIWorld({bounds:{x:500,y:500}});
    // this.world.addWall(new AIWorld.Wall({x1:100, x2:400, y1:100, y2:100}));
    // this.world.addWall(new AIWorld.Wall({x1:400, x2:400, y1:100, y2:400}));
    // this.world.addWall(new AIWorld.Wall({x1:400, x2:100, y1:400, y2:400}));
    // this.world.addWall(new AIWorld.Wall({x1:100, x2:100, y1:400, y2:100}));

    // this.renderer = new AICanvasRenderer(this.refs.canvas.getDOMNode(), this.world)
    // this.robot = new AIRobot({x:250,y:250,angle:0, world:this.world});
    // this.world.addRobot(this.robot);
    // this.renderer.render();
    // this.simulator = new AISimulator(this.world, this.renderer);
    // this.augmentBot(this.state.code);
    // this.simulator.run();
  },

  handleCodeChange: function(event) {
    var code = event.target.value;
    this.setState({code:code});
    // if (!this.simulator.running) {
    //   this.simulator.run();
    // }
  },

  render: function() {
    return (
      <div className="row">
        <div className="col-md-6">
          <CodeEditor ref="editor" onChange={this.handleCodeChange} value={this.state.code}/>
        </div>
        <div className="col-md-6">
          <AIGame ref="game" code={this.state.code}/>
        </div>
      </div>
    );
  }
});

module.exports = AILandingPage;