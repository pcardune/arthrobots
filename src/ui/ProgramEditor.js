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
var React = require('react');
var Glyphicon = require('react-bootstrap').Glyphicon;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;

var Tab = require('./Tab');
var Markdown = require('./Markdown');
var WorldCanvas = require('./WorldCanvas');
var CodeEditor = require('./CodeEditor');

var WorldModel = require('../models/WorldModel');
var TrackModel = require('../models/TrackModel');
var ProgramModel = require('../models/ProgramModel');
var ProgramParser = require('../core/ProgramParser');
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
      errors: [],
      lastExecutedLine: null,
      showCheckpointAtIndex: null,
      codeIsJS: false,
      isSaving: false
    }
  },

  handleSave: function(callback) {
    var program = this.state.programModel;
    if (!program) {
      program = new ProgramModel();
      program.set('owner', Parse.User.current());
      program.set('world', this.props.worldModel);
      var acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(Parse.User.current().id, true);
      program.setACL(acl);
    }
    var code = this.state.programCode;
    if (program.get('code') == code) {
      callback(program);
      return;
    }
    program.set('code', code);
    this.setState({isSaving: true});
    program.save(null, {
      success: function(world) {
        // Execute any logic that should take place after the object is saved.
        this.setState({
          programModel:program,
          isSaving: false
        });
        callback(program);
      }.bind(this),
      error: function(gameScore, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        this.setState({isSaving: false});
        alert('Failed to save program, with error code: ' + error.message);
      }.bind(this)
    });
  },

  loadProgram: function(worldModel) {
    if (worldModel) {
      worldModel.loadCurrentUserPrograms(function(programs){
        if (programs) {
          var code = programs[0] ? programs[0].get('code') : '';
          this.setState({
            programModel: programs[0],
            programCode: code,
            codeIsJS: code.indexOf("(") > 0
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
    this.refs.codeEditor.setState({editing:true});
  },

  handleDemo: function() {
    Parse.Analytics.track('runDemo', {world:this.props.worldModel.id});
    this.handleReset();
    var demoSolution = this.props.worldModel.get('solution');
    program = new ProgramParser(demoSolution, this.refs.worldCanvas.world.robot).parse();
    this.runner = new Runner(program, this.refs.worldCanvas.renderer);
    this.setState({runState: "demo"});
    this.runner.run(
      this.getSpeed(),
      this.handleRunnerStopped
    );
  },

  handleStopDemo: function() {
    this.handleStop();
    this.handleReset();
  },

  handleRun: function() {
    Parse.Analytics.track('runProgram', {world:this.props.worldModel.id});
    this.handleSave(function(){
      this.handleReset();
      var parser = new ProgramParser(this.state.programCode, this.refs.worldCanvas.world.robot);
      if (this.state.programCode.indexOf('(') > 0) {
        //it's javascript
        var js = parser.wrapJSForEval();
        var robot = this.refs.worldCanvas.world.robot;
        for (var key in robot) {
          if (typeof robot[key] == "function") {
            robot[key] = robot[key].bind(robot);
          }
        }
        (function(robot) {
          eval(js);
        })(robot)
        this.refs.worldCanvas.renderer.render(1);
        this.handleRunnerStopped();
        return
      }
      try {
        this.program = parser.parse();
      } catch (e) {
        this.setState({runState:"", errors:[e]});
        return
      }
      this.refs.codeEditor.setState({editing:false});
      this.runner = new Runner(this.program, this.refs.worldCanvas.renderer);
      this.handleContinue();
    }.bind(this));
  },

  getSpeed: function() {
    var ms = {"Slow":500,"Medium":200,"Fast":50, "Very Fast":1};
    return ms[this.state.speed];
  },

  handleStop: function() {
    this.runner && this.runner.stop();
    this.setState({runState: "stopped"});
  },

  handleContinue: function() {
    this.setState({runState: "running"});

    this.runner.run(
      this.getSpeed(),
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
    this.refs.codeEditor.setState({editing:true});
  },

  runnerDidStep: function(runner, lastExpression) {
    if (lastExpression.instruction.lastExecutedLine) {
      this.setState({lastExecutedLine: lastExpression.instruction.lastExecutedLine});
    }
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
          if (this.state.programModel.get('finished')) {
            // already finished
            this.props.onFinished(this.state.programModel);
          } else {
            this.state.programModel.set('finished', true);
            this.state.programModel.save({
              success: function(program) {
                Parse.Analytics.track('finishedWorld', {world:this.props.worldModel.id});
                this.setState({programModel:program});
                this.props.onFinished(program);
              }.bind(this)
            });
          }
        }
      }
    }
  },

  handleStep: function() {
    if (!this.runner) {
      this.program = LangParser.newParser(lines, this.refs.worldCanvas.world.robot).parse();
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
    this.refs.codeEditor.setState({editing:true});
  },

  handleProgramChange: function (event) {
    this.setState(
      {
        programCode:event.target.value,
        codeIsJS: event.target.value.indexOf("(") >= 0
      }
    );
    this.refs.codeEditor.setState({editing:true});
  },

  handleSpeedClick: function(speed) {
    this.setState({speed:speed});
    Parse.Analytics.track('setSpeed', {speed:speed, world:this.props.worldModel.id});
  },

  handleMouseoverStep: function(index) {
    if (this.state.runState == '') {
      this.setState({showCheckpointAtIndex:index});
    }
  },

  handleMouseoutStep: function(index) {
    this.setState({showCheckpointAtIndex:null});
  },

  render: function() {
    var buttons = [];
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
    } else if (this.state.runState == 'demo') {
      buttons = <Button onClick={this.handleStopDemo} bsStyle="danger" className="pull-right">Stop Demo</Button>
    } else if (this.state.runState == '') {
      buttons = [
        !this.state.codeIsJS ?
        <DropdownButton key="5" title={"Speed: "+this.state.speed}>
          <MenuItem key="1" onClick={this.handleSpeedClick.bind(this, 'Slow')}>Slow</MenuItem>
          <MenuItem key="2" onClick={this.handleSpeedClick.bind(this, 'Medium')}>Medium</MenuItem>
          <MenuItem key="3" onClick={this.handleSpeedClick.bind(this, 'Fast')}>Fast</MenuItem>
          <MenuItem key="4" onClick={this.handleSpeedClick.bind(this, 'Very Fast')}>Very Fast</MenuItem>
        </DropdownButton>
        : null,
        <Button key="6" onClick={this.handleRun} bsStyle="primary" className="pull-right">
          {this.state.isSaving ? "Saving..." : "Save + Run"}
        </Button>,
        this.props.worldModel.get('solution') ?
        <Button key="7" onClick={this.handleDemo} className="pull-right">Demo</Button> : null
      ];
    }
    if (this.props.worldModel && this.props.worldModel.get('steps')) {
      var completedSteps = [];
      for (var i = 0; i < this.props.worldModel.get('steps').length; i++) {
        completedSteps.push(
          <div
            key={i}
            onMouseOver={this.handleMouseoverStep.bind(this, i)}
            onMouseOut={this.handleMouseoutStep.bind(this, i)}
            className={"badge "+(i<this.state.completedSteps ? "active" : "")}>
            {i+1}
          </div>
        );
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

    var worldCanvas = <WorldCanvas ref="worldCanvas" worldDefinition={this.props.worldModel.get('definition')} />;
    if (this.state.showCheckpointAtIndex != null) {
      worldCanvas = <WorldCanvas ref="stepCanvas" worldDefinition={this.props.worldModel.get('steps')[this.state.showCheckpointAtIndex]} />;
    }

    var languageDetect = null;
    if (this.state.codeIsJS) {
      var tooltip = (
        <Tooltip>
          When you have parentheses in your program, it will be executed instantly as straight javascript.
        </Tooltip>
      );
      languageDetect = (
        <OverlayTrigger placement="top" overlay={tooltip}>
          <p className="pull-right"><small>Interpreting as JavaScript</small></p>
        </OverlayTrigger>
      );
    }

    return (
      <div className={"ProgramEditor row"}>
        <div className="col-md-6">
          <ModalTrigger modal={helpModal}>
            <Glyphicon glyph="question-sign" className="helpButton"/>
          </ModalTrigger>
          <ButtonToolbar className="buttons">
            {buttons}
          </ButtonToolbar>
          <CodeEditor
            ref="codeEditor"
            selectedLine={this.state.lastExecutedLine}
            onChange={this.handleProgramChange}
            value={this.state.programCode}/>
          {languageDetect}
        </div>
        <div className="col-md-6">
          <div className="worldOverlay error">
            {this.state.errors.map(function(e) {
              return <div>{e.message}</div>
            })}
          </div>
          {this.state.isFinished ?
            <div className="worldOverlay success">
              <div>
                Great Success!
                &nbsp;
                <Button
                  onClick={function(){this.props.onContinue(this.state.programModel)}.bind(this)}
                  bsStyle="success">
                  Next Level
                </Button>
              </div>
            </div>
           : null}
          {worldCanvas}
          <div>checkpoints:{completedSteps}</div>
        </div>
      </div>
    );
  }
});

module.exports = ProgramEditor;