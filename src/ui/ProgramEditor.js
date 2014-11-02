/** @jsx React.DOM */
var ActiveState = require('react-router').ActiveState;
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Link = require('react-router').Link;
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var Parse = require('parse').Parse;
var React = require('react');

var Tab = require('./Tab');
var Markdown = require('./Markdown');
var WorldCanvas = require('./WorldCanvas');
var CodeEditor = require('./CodeEditor');

var WorldModel = require('../models/WorldModel');
var TrackModel = require('../models/TrackModel');
var ProgramModel = require('../models/ProgramModel');
var parser = require('../core/parser');
var Runner = require('../core/Runner');
var WorldParser = require('../core/WorldParser');
var World = require('../core/World');

require('./ProgramEditor.css')
var ProgramEditor = React.createClass({

  getDefaultProps: function() {
    return {
      worldModel: null,
      onFinished: function(){}
    };
  },

  getInitialState: function() {
    return {
      runState: "",
      programModel: null,
      programCode: '',
      completedSteps: 0,
      isFinished: false
    }
  },

  handleSave: function() {
    var program = this.state.programModel;
    if (!program) {
      program = new ProgramModel();
      program.set('owner', Parse.User.current());
      program.set('world', this.props.worldModel);
    }
    var code = this.refs.codeEditor.getDOMNode().value;
    if (program.get('code') == code) {
      return;
    }
    program.set('code', code);
    program.save(null, {
      success: function(world) {
        // Execute any logic that should take place after the object is saved.
        this.setState({
          programModel:program,
        });
      }.bind(this),
      error: function(gameScore, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        alert('Failed to save program, with error code: ' + error.message);
      }.bind(this)
    });
  },

  loadProgram: function(worldModel) {
    if (worldModel) {
      worldModel.loadCurrentUserPrograms(function(programs){
        if (programs) {
          this.setState({
            programModel:programs[0],
            programCode:programs[0] ? programs[0].get('code') : ''
          });
        }
      }.bind(this))
    }
  },

  componentDidMount: function() {
    this.loadProgram(this.props.worldModel);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.worldModel != this.props.worldModel) {
      this.loadProgram(nextProps.worldModel);
      this.setState({isFinished: false, completedSteps: 0});
    }
  },

  handleRun: function() {
    this.handleSave();
    var lines = this.refs.codeEditor.getDOMNode().value.split('\n');
    this.refs.worldCanvas.renderWorld();
    this.program = parser.newParser(lines, this.refs.worldCanvas.world.robot).parse();
    this.runner = new Runner(this.program, this.refs.worldCanvas.renderer);
    this.handleContinue();
  },

  handleStop: function() {
    this.runner && this.runner.stop();
    this.setState({runState: "stopped"});
  },

  handleContinue: function() {
    this.setState({runState: "running"});
    this.runner.run(
      200,
      this.setState.bind(this, {runState: ""}),
      this.runnerDidStep
    );
  },

  runnerDidStep: function(runner) {
    var worldSteps = this.props.worldModel.get('steps');
    if (worldSteps && worldSteps.length > this.state.completedSteps) {
      var nextStepWorld = this.props.worldModel.getNewWorldAtStep(this.state.completedSteps);
      if (this.refs.worldCanvas.world.isEqualTo(nextStepWorld)) {
        var isFinished = worldSteps.length <= this.state.completedSteps + 1;
        this.setState({
          completedSteps: this.state.completedSteps + 1,
          isFinished: isFinished
        });
        if (isFinished) {
          this.state.programModel.set('finished', true);
          this.state.programModel.save({
            success: function(program) {
              this.setState({programModel:program});
            }.bind(this)
          })
        }
      }
    }
  },

  handleStep: function() {
    if (!this.runner) {
      this.program = parser.newParser(lines, this.refs.worldCanvas.world.robot).parse();
      this.runner = new Runner(this.program, this.refs.worldCanvas.renderer);
    }
    this.runner.step(
      this.setState.bind(this, {runState: ""}),
      this.runnerDidStep
    );
  },

  handleProgramChange: function (event) {
    this.setState({programCode:event.target.value});
  },

  render: function() {
    var buttons;
    if (this.state.runState == "running") {
      buttons = [
        <Button onClick={this.handleStop} className="pull-right" bsStyle="danger">Stop</Button>
      ];
    } else if (this.state.runState == "stopped") {
      buttons = [
        <Button onClick={this.handleContinue} className="pull-right" bsStyle="primary">Continue</Button>,
        <Button onClick={this.handleStep} className="pull-right">Step</Button>
      ];
    } else {
      buttons = [
        <Button onClick={this.handleRun} bsStyle="primary" className="pull-right">Save + Run</Button>,
      ];
    }
    if (this.props.worldModel && this.props.worldModel.get('steps')) {
      var completedSteps = [];
      for (var i = 0; i < this.props.worldModel.get('steps').length; i++) {
        completedSteps.push(<span className={"badge "+(i<this.state.completedSteps ? "active" : "")}>{i+1}</span>);
      }
    }

    return (
      <div className="ProgramEditor row">
        <div className="col-md-6">
          <CodeEditor
            ref="codeEditor"
            style={{minHeight:"300px"}}
            onChange={this.handleProgramChange}
            value={this.state.programCode}/>
          <ButtonToolbar className="buttons">
            {buttons}
          </ButtonToolbar>
        </div>
        <div className="col-md-6">
          <WorldCanvas ref="worldCanvas" worldDefinition={this.props.worldModel.get('definition')} />
          <div className="pull-right">
            {completedSteps}<br />
            {this.state.isFinished ? <Button onClick={this.props.onContinue} bsStyle="success" className="pull-right">Continue!</Button>: null}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProgramEditor;