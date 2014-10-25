/** @jsx React.DOM */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;

var World = require('../core/World');
var WorldParser = require('../core/WorldParser');
var parser = require('../core/parser');
var Runner = require('../core/Runner');
var CanvasRenderer = require('../core/CanvasRenderer');

require('./LandingPage.css');

var LandingPage = React.createClass({

  getDefaultProps: function() {
    return {
      exampleProgram: ""+
        "define turnright:\n"+
        "    do 3:\n"+
        "        turnleft\n"+
        "\n"+
        "define follow_right_wall:\n"+
        "    if right_is_clear:\n"+
        "        turnright\n"+
        "        move\n"+
        "    elif front_is_clear:\n"+
        "        move\n"+
        "    else:\n"+
        "        turnleft\n"+
        "\n"+
        "while not_next_to_a_beeper:\n"+
        "    follow_right_wall\n"+
        "\n"+
        "turnoff\n",
      exampleWorld: [
        'Robot 2 1 E 0',
        'Beepers 1 1 1',
        'Wall 9 1 E 2',
        'Wall 2 3 E 2',
        'Wall 9 5 E 3',
        'Wall 1 7 N 9',
        'Wall 3 2 N 7',
        'Wall 3 4 N 7'
      ]
    }
  },

  componentDidMount: function() {
    this.world = new World();
    var parser = new WorldParser(this.props.exampleWorld, this.world);
    parser.parse();
    this.renderer = new CanvasRenderer('exampleCanvas', this.world);
    this.renderer.render();
  },

  handleRun: function() {
    var lines = this.props.exampleProgram.split('\n');
    var program = parser.newParser(lines, this.world.robot).parse();
    //define a runner to run the program.
    var runner = new Runner(program, this.renderer);
    //run the program at a rate of 5 execution steps per second.
    runner.run(200);
  },

  render: function() {

    return (
      <div className="row landingPage">
        <div className="col-md-6">
          <pre>
            {this.props.exampleProgram}
          </pre>
          <Button onClick={this.handleRun}>Run</Button>
        </div>
        <div className="col-md-6">
          <canvas height="500" width="500" id="exampleCanvas"/>
        </div>
      </div>
    );
  }
});

module.exports = LandingPage;