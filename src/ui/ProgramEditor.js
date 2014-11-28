/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var DropdownButton = require('react-bootstrap').DropdownButton;
var Link = require('react-router').Link;
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var MenuItem = require('react-bootstrap').MenuItem;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var Parse = require('parse').Parse;
var React = require('react');
var Glyphicon = require('react-bootstrap').Glyphicon;

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
      isFinished: false,
      speed: 'Medium',
      errors: []
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
      this.setState({isFinished: false, completedSteps: 0, runState:''});
    }
  },

  handleReset: function() {
    this.refs.worldCanvas.renderWorld();
    this.setState({runState:"",errors:[]});
  },

  handleRun: function() {
    this.handleSave();
    this.handleReset();
    var lines = this.refs.codeEditor.getDOMNode().value.split('\n');
    try {
      this.program = parser.newParser(lines, this.refs.worldCanvas.world.robot).parse();
    } catch (e) {
      this.setState({runState:"", errors:[e]});
      return
    }
    this.runner = new Runner(this.program, this.refs.worldCanvas.renderer);
    this.handleContinue();
  },

  handleStop: function() {
    this.runner && this.runner.stop();
    this.setState({runState: "stopped"});
  },

  handleContinue: function() {
    this.setState({runState: "running"});
    var ms = {"Slow":500,"Medium":200,"Fast":50, "Very Fast":1};
    this.runner.run(
      ms[this.state.speed],
      this.handleRunnerStopped,
      this.runnerDidStep,
      this.runnerDidError
    );
  },

  runnerDidError: function(error) {
    this.setState({
      errors:[error],
      runState:"stopped"
    });
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
              this.props.onFinished(program);
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
      this.handleRunnerStopped,
      this.runnerDidStep,
      this.runnerDidError
    );
  },

  handleRunnerStopped: function() {
    this.setState({runState: "finished"});
  },

  handleProgramChange: function (event) {
    this.setState({programCode:event.target.value});
  },

  handleSpeedClick: function(speed) {
    this.setState({speed:speed});
  },

  render: function() {
    var buttons;
    if (this.state.runState == "running") {
      buttons = [
        <Button key="1" onClick={this.handleStop} className="pull-right" bsStyle="danger">Stop</Button>
      ];
    } else if (this.state.runState == "stopped") {
      buttons = [
        <Button key="1" onClick={this.handleContinue} className="pull-right" bsStyle="primary">Continue</Button>,
        <Button key="2" onClick={this.handleStep} className="pull-right">Step</Button>,
        <Button key="3" onClick={this.handleReset} className="pull-right">Reset</Button>
      ];
    } else if (this.state.runState == "finished") {
      buttons = [
        <Button key="4" onClick={this.handleReset} bsStyle="primary" className="pull-right">Reset</Button>
      ];
    } else {
      buttons = [
        <DropdownButton key="5" title={"Speed: "+this.state.speed}>
          <MenuItem key="1" onClick={this.handleSpeedClick.bind(this, 'Slow')}>Slow</MenuItem>
          <MenuItem key="2" onClick={this.handleSpeedClick.bind(this, 'Medium')}>Medium</MenuItem>
          <MenuItem key="3" onClick={this.handleSpeedClick.bind(this, 'Fast')}>Fast</MenuItem>
          <MenuItem key="4" onClick={this.handleSpeedClick.bind(this, 'Very Fast')}>Very Fast</MenuItem>
        </DropdownButton>,
        <Button key="6" onClick={this.handleRun} bsStyle="primary" className="pull-right">Save + Run</Button>,
      ];
    }
    if (this.props.worldModel && this.props.worldModel.get('steps')) {
      var completedSteps = [];
      for (var i = 0; i < this.props.worldModel.get('steps').length; i++) {
        completedSteps.push(<span key={i} className={"badge "+(i<this.state.completedSteps ? "active" : "")}>{i+1}</span>);
      }
    }

    var helpModal = (
      <Modal title="Quick Reference">
        <div className="modal-body">
          <h4>Instructions</h4>
          <pre>
            move{'\n'}
            turnleft{'\n'}
            pickbeeper{'\n'}
            putbeeper{'\n'}
            turnoff{'\n'}
          </pre>
          <h4>Conditions</h4>
          <pre>
            front_is_clear{'\n'}
            front_is_blocked{'\n'}
            left_is_clear{'\n'}
            left_is_blocked{'\n'}
            right_is_clear{'\n'}
            right_is_blocked{'\n'}
            {'\n'}
            next_to_a_beeper{'\n'}
            not_next_to_a_beeper{'\n'}
            any_beepers_in_beeper_bag{'\n'}
            no_beepers_in_beeper_bag{'\n'}
            {'\n'}
            facing_north{'\n'}
            not_facing_north{'\n'}
            facing_south{'\n'}
            not_facing_south{'\n'}
            facing_east{'\n'}
            not_facing_east{'\n'}
            facing_west{'\n'}
            not_facing_west{'\n'}
          </pre>
          <h4>Iteration</h4>
          <pre>
            {'do <positive_number>:\n'}
            {'    <block>'}
          </pre>
          <pre>
            {'while <test>:\n'}
            {'    <block>'}
          </pre>
          <h4>Defining new instructions</h4>
          <pre>
            {'define <new_name>:\n'}
            {'    <block>'}
          </pre>
        </div>
      </Modal>
    );

    return (
      <div className={"ProgramEditor row"}>
        <div className="col-md-6">
          <ModalTrigger modal={helpModal}>
            <Glyphicon glyph="question-sign" className="helpButton"/>
          </ModalTrigger>
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
          <div className="errorList">
            {this.state.errors.map(function(e) {
              return <div>{e.message}</div>
            })}
          </div>
          <WorldCanvas ref="worldCanvas" worldDefinition={this.props.worldModel.get('definition')} />
          <div className="pull-right">
            {completedSteps}<br />
            {this.state.isFinished ?
              <Button
                onClick={function(){this.props.onContinue(this.state.programModel)}.bind(this)}
                bsStyle="success"
                className="pull-right">
                Continue!
              </Button> :
              null}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProgramEditor;