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
      isRunning: false
    }
  },

  handleRun: function() {
    var lines = this.refs.codeEditor.getDOMNode().value.split('\n');
    console.log("lines", lines);
    var program = parser.newParser(lines, this.refs.worldCanvas.world.robot).parse();
    var runner = new Runner(program, this.refs.worldCanvas.renderer);
    runner.run(200);
  },

  render: function() {
    return (
      <div className="ProgramEditor row">
        <div className="col-md-6">
          <CodeEditor ref="codeEditor" style={{minHeight:"300px"}}/>
          <ButtonToolbar className="buttons">
            <Button onClick={this.handleRun} bsStyle="success" className="pull-right">Run</Button>
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