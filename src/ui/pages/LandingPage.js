var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Jumbotron = require('react-bootstrap').Jumbotron;
var Link = require('react-router').Link;
var Navigation = require('react-router').Navigation;
var React = require('react');

var World = require('../../core/World');
var ProgramParser = require('../../core/ProgramParser');
var Runner = require('../../core/Runner');
var CanvasRenderer = require('../../core/CanvasRenderer');

var WorldCanvas = require('../WorldCanvas');
var UserUtils = require('../../UserUtils');

require('./LandingPage.css');
var LandingPage = React.createClass({

  mixins: [Navigation],

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
        "while any_beepers_in_beeper_bag:\n"+
        "    follow_right_wall\n"+
        "\n"+
        "\n",
      exampleWorld:
        'Robot 2 1 E 1\n'+
        'Wall 9 1 E 2\n'+
        'Wall 2 3 E 2\n'+
        'Wall 9 5 E 3\n'+
        'Wall 1 7 N 9\n'+
        'Wall 3 2 N 7\n'+
        'Wall 3 4 N 7\n'
    }
  },

  componentDidMount: function() {
    this.handleRun();
  },

  handleRun: function() {
    var parser = new ProgramParser(this.props.exampleProgram, this.refs.worldCanvas.world.robot);
    var program = parser.parse();

    //define a runner to run the program.
    this.runner = new Runner(program, this.refs.worldCanvas.renderer, null, console.log);
    //run the program at a rate of 5 execution steps per second.
    this.runner.run(100);
  },

  componentWillUnmount: function() {
    this.runner.stop();
  },

  handleChooseTrack: function(trackId) {
    if (!Parse.User.current()) {
      UserUtils.loginAnonymousUser({
        success:function() {
          window.location = "/tracks/"+trackId;
        }.bind(this),
        error: function() {
          window.location = "/login";
        }
      });
    }
  },

  render: function() {
    var buttonToolbar;
    if (Parse.User.current()) {
      buttonToolbar = (
        <ButtonToolbar>
          <Link to="/tracks/yh1vdAIkHs" className="btn btn-success" bsSize="large">Beginner</Link>
          <Link to="/tracks/02eHrPIc55" className="btn btn-danger" bsSize="large">Advanced</Link>
        </ButtonToolbar>
      );
    } else {
      buttonToolbar = (
        <ButtonToolbar>
          <Button onClick={this.handleChooseTrack.bind(this, 'yh1vdAIkHs')} bsStyle="success" bsSize="large">Beginner</Button>
          <Button onClick={this.handleChooseTrack.bind(this, '02eHrPIc55')} bsStyle="danger" bsSize="large">Advanced</Button>
        </ButtonToolbar>
      );
    }
    return (
      <div className="row landingPage">
        <div className="col-md-12">
          <Jumbotron>
            <WorldCanvas className="pull-right" worldDefinition={this.props.exampleWorld} ref="worldCanvas"/>
            <h1>Arthrobots</h1>
            <p>Robots, exploring a world, completely at your command!</p>
            <p>Choose your level: </p>
            {buttonToolbar}
          </Jumbotron>
        </div>
      </div>
    );
  }
});

module.exports = LandingPage;