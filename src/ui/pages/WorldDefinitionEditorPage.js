/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Glyphicon = require('react-bootstrap').Glyphicon;
var Input = require('react-bootstrap').Input;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Nav = require('react-bootstrap').Nav;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;
var React = require('react');
var assign = require('object-assign');
var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var Markdown = require('../Markdown');
var CodeEditor = require('../CodeEditor');
var TrackDropdown = require('../TrackDropdown');
var WorldCanvas = require('../WorldCanvas');
var CodeRunner = require('../CodeRunner');

require('./WorldDefinitionEditorPage.css');
var WorldDefinitionEditorPage = React.createClass({

  mixins: [Navigation, State, FluxMixin, StoreWatchMixin("WorldStore")],

  getDefaultProps: function() {
    return {
      world: null
    };
  },

  getStateFromFlux: function() {
    var store = this.getFlux().store("WorldStore");
    worldModel = store.getWorld(this.props.world.id);
    return {
      worldModel: worldModel,
      worldSolution: worldModel.get('solution'),
      worldStepDefinitions: worldModel.getSteps(),
      saving: store.isLoading(),
      needsSave: false
    };
  },

  getInitialState: function() {
    return {
      currentStep: 0
    };
  },

  handleChange: function() {
    var modelSteps = this.state.worldModel.getSteps();
    var needsSave = modelSteps.length !== this.state.worldStepDefinitions.length;
    if (!needsSave) {
      this.state.worldStepDefinitions.forEach(function(stepDefinition, index) {
        if (stepDefinition !== modelSteps[index]) {
          needsSave = true;
        }
      });
    }

    this.setState({needsSave: needsSave});
  },

  handleChangeStep: function(index, event) {
    this.state.worldStepDefinitions[index] = event.target.value;
    this.setState({worldStepDefinitions:this.state.worldStepDefinitions});
    this.handleChange();
  },

  handleSave: function() {
    this.setState({saving: true});
    this.state.worldModel.setSteps(this.state.worldStepDefinitions);
  },

  handleSaveAndRun: function(callback) {
    this.getFlux().actions.saveWorld(
      {solution: this.refs.codeRunner.state.programCode},
      this.state.worldModel,
      callback
    );
  },

  handleAddStep: function() {
    var worldStepDefinitions = this.state.worldStepDefinitions;
    worldStepDefinitions.push(worldStepDefinitions[worldStepDefinitions.length-1]);
    this.setState({
      worldStepDefinitions: worldStepDefinitions,
      currentStep: this.state.currentStep+1
    });
    this.handleChange();
    this.handleSave();
  },

  handleRemoveStep: function(index) {
    if (index <= 0) {
      return;
    }
    var worldStepDefinitions = this.state.worldStepDefinitions;
    worldStepDefinitions.splice(index, 1);
    this.setState({
      worldStepDefinitions:worldStepDefinitions,
      currentStep: this.state.currentStep - 1
    });
    this.handleChange();
    this.handleSave();
  },

  handleNextStep: function() {
    if (this.state.currentStep < this.state.worldStepDefinitions.length) {
      this.setState({
        currentStep: this.state.currentStep + 1
      });
    }
  },

  handlePrevStep: function() {
    if (this.state.currentStep > 0) {
      this.setState({
        currentStep: this.state.currentStep - 1
      });
    }
  },

  render: function() {
    if (this.state.isLoading || !this.state.worldModel) {
      return <div>loading...</div>;
    }

    var index = this.state.currentStep;
    var definition = this.state.worldStepDefinitions[this.state.currentStep];
    return (
      <div className="WorldDefinitionEditorPage">
        <div className="row">
          <div className="col-md-4">
            <form>
              <Button disabled={this.state.currentStep <= 0} onClick={this.handlePrevStep}>Prev Step</Button>
              <Button disabled={this.state.currentStep >= this.state.worldStepDefinitions.length - 1} onClick={this.handleNextStep}>Next Step</Button>
              {this.state.saving ? "Saving..." : null}
              <h6>
                Step {index}
                <Glyphicon onClick={this.handleRemoveStep.bind(this, index)} className="pull-right" glyph="remove"/>
              </h6>
              <CodeEditor onChange={this.handleChangeStep.bind(this, index)} className="form-control" value={definition}/>
              <div className="text-right">
                <Button onClick={this.handleAddStep}>Add Step</Button>
                <Button onClick={this.handleSave} disabled={!this.state.needsSave} bsStyle={this.state.needsSave ? "primary" : "default"}>Save</Button>
              </div>
            </form>
          </div>
          <div className="worldPane col-md-8">
            <CodeRunner
              ref="codeRunner"
              world={this.state.worldModel}
              initialCode={this.state.worldSolution}
              showStep={this.state.currentStep}
              onSaveAndRun={this.handleSaveAndRun}
              isSaving={this.state.saving}/>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = WorldDefinitionEditorPage;