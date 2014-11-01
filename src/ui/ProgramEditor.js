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


require('./ProgramEditor.css')
var ProgramEditor = React.createClass({

  getDefaultProps: function() {
    return {
      worldModel: null,
    };
  },

  getInitialState: function() {
    return {
      isRunning: false,
      programModel: null,
      programCode: ''
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

  componentDidMount: function() {
    if (this.props.worldModel) {
      this.props.worldModel.loadCurrentUserPrograms(function(programs){
        if (programs) {
          this.setState({
            programModel:programs[0],
            programCode:programs[0].get('code')
          });
        }
      }.bind(this));
    }
  },

  handleRun: function() {
    this.handleSave();
    var lines = this.refs.codeEditor.getDOMNode().value.split('\n');
    var program = parser.newParser(lines, this.refs.worldCanvas.world.robot).parse();
    var runner = new Runner(program, this.refs.worldCanvas.renderer);
    runner.run(200);
  },

  handleProgramChange: function (event) {
    this.setState({programCode:event.target.value});
  },

  render: function() {
    return (
      <div className="ProgramEditor row">
        <div className="col-md-6">
          <CodeEditor
            ref="codeEditor"
            style={{minHeight:"300px"}}
            onChange={this.handleProgramChange}
            value={this.state.programCode}/>
          <ButtonToolbar className="buttons">
            <Button onClick={this.handleRun} bsStyle="success" className="pull-right">Save + Run</Button>
            <Button className="pull-right">Step</Button>
          </ButtonToolbar>
        </div>
        <div className="col-md-6">
          <WorldCanvas ref="worldCanvas" worldDefinition={this.props.worldModel.get('definition')} />
        </div>
      </div>
    );
  }
});

module.exports = ProgramEditor;