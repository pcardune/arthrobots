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
import CodeRunner from '../CodeRunner'

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
    var worldModel = store.getWorld(this.props.world.id);
    return {
      worldModel: worldModel,
      worldSolution: worldModel.get('solution'),
      saving: store.isLoading()
    };
  },

  getInitialState: function() {
    return {
      currentStep: 0
    };
  },

  handleChangeStep: function(index, event) {
    var stepDefinitions = this.state.worldModel.getSteps();
    stepDefinitions[index] = event.target.value;
    this.state.worldModel.setSteps(stepDefinitions);
    this.getFlux().actions.saveWorldLocal({}, this.state.worldModel);
  },

  handleSave: function() {
    this.getFlux().actions.saveWorld({}, this.state.worldModel);
  },

  handleSaveAndRun: function(callback) {
    this.getFlux().actions.saveWorld(
      {solution: this.refs.codeRunner.state.programCode},
      this.state.worldModel,
      callback
    );
  },

  handleAddStep: function() {
    var worldStepDefinitions = this.state.worldModel.getSteps();
    worldStepDefinitions.push(worldStepDefinitions[worldStepDefinitions.length-1]);
    this.state.worldModel.setSteps(worldStepDefinitions);
    this.getFlux().actions.saveWorldLocal({}, this.state.worldModel);
    this.setState({currentStep: this.state.currentStep+1});
  },

  handleRemoveStep: function(index) {
    if (index <= 0) {
      return;
    }
    var worldStepDefinitions = this.state.worldModel.getSteps();
    worldStepDefinitions.splice(index, 1);
    this.state.worldModel.setSteps(worldStepDefinitions);
    this.getFlux().actions.saveWorldLocal({}, this.state.worldModel);
    this.setState({currentStep: this.state.currentStep - 1});
  },

  handleNextStep: function() {
    if (this.state.currentStep < this.state.worldModel.getSteps().length) {
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
    var definition = this.state.worldModel.getSteps()[this.state.currentStep];
    return (
      <div className="WorldDefinitionEditorPage">
        <div className="row">
          <div className="col-md-4">
            <form>
              <h6>
                <Button className="pull-left" disabled={this.state.currentStep <= 0} onClick={this.handlePrevStep}>
                  <Glyphicon glyph="chevron-left" />
                </Button>
                Checkpoint {index}
                <Button
                  className="pull-right"
                  disabled={this.state.currentStep >= this.state.worldModel.getSteps().length - 1}
                  onClick={this.handleNextStep}>
                  <Glyphicon glyph="chevron-right" />
                </Button>
              </h6>

              <CodeEditor onChange={this.handleChangeStep.bind(this, index)} className="form-control" value={definition}/>
              <div className="buttons text-right">
                <Button onClick={this.handleRemoveStep.bind(this, index)}>Remove</Button>
                {' '}
                <Button onClick={this.handleAddStep}>Add</Button>
                {' '}
                <Button
                  onClick={this.handleSave}
                  disabled={!this.state.worldModel.needsSave}
                  bsStyle={this.state.worldModel.needsSave ? "primary" : "default"}>
                  {this.state.saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
          <div className="worldPane col-md-8">
            <h3>Edit Demo Solution</h3>
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