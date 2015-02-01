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
var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var Tab = require('./Tab');
var Markdown = require('./Markdown');
var WorldCanvas = require('./WorldCanvas');
var CodeEditor = require('./CodeEditor');
var CodeRunner = require('./CodeRunner');
var LoadingBlock = require('./LoadingBlock');

var WorldModel = require('../models/WorldModel');
var TrackModel = require('../models/TrackModel');
var ProgramModel = require('../models/ProgramModel');

var ProgramStore = require('../stores/ProgramStore');

var ProgramParser = require('../core/ProgramParser');
var Runner = require('../core/Runner');
var WorldParser = require('../core/WorldParser');
var World = require('../core/World');

require('./ProgramEditor.css')
var ProgramEditor = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("ProgramStore")],

  getDefaultProps: function() {
    return {
      worldModel: null,
      onFinished: function(){},
      onContinue: function(programModel){}
    };
  },

  getStateFromFlux: function() {
    var programStore = this.getFlux().store("ProgramStore");
    var programModel = programStore.getProgramForWorld(this.props.worldModel.id);
    var code = programModel ? programModel.get('code') : '';
    return {
      programModel: programModel,
      isSaving: programStore.isLoading()
    };
  },

  componentDidMount: function() {
    window.setTimeout(function() {
      this.getFlux().actions.loadPrograms();
    }.bind(this));
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.worldModel != this.props.worldModel) {
      window.setTimeout(function() {
        this.setState(this.getStateFromFlux());
      }.bind(this));
    }
  },

  handleSaveAndRun: function(callback) {
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
    var code = this.refs.codeRunner.state.programCode;
    if (program.get('code') == code) {
      callback(program);
      return;
    }
    this.getFlux().actions.saveProgram(
      {code:code},
      program,
      callback
    );
  },

  handleFinished: function() {
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
  },

  handleContinue: function() {
    this.props.onContinue(this.state.programModel);
  },

  render: function() {
    return (
      <CodeRunner
        ref="codeRunner"
        world={this.props.worldModel}
        isSaving={this.state.isSaving}
        initialCode={this.state.programModel ? this.state.programModel.get('code') : ''}
        onFinished={this.handleFinished}
        onSaveAndRun={this.handleSaveAndRun}
        onContinue={this.handleContinue}/>
    );
  }
});

module.exports = ProgramEditor;