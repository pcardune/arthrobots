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

var Markdown = require('../Markdown');
var CodeEditor = require('../CodeEditor');
var TrackDropdown = require('../TrackDropdown');

var WorldModel = require('../../models/WorldModel');
var WorldCanvas = require('../WorldCanvas');

require('./WorldDefinitionEditorPage.css');
var WorldDefinitionEditorPage = React.createClass({

  mixins: [Navigation, State],

  getDefaultProps: function() {
    return {
      world: null,
      onWorldChange: function() {}
    };
  },

  getInitialState: function() {
    return {
      worldModel: null,
      worldSolution: '',
      needsSave: false,
      worldStepDefinitions: [],
      currentStep: 0
    }
  },

  componentDidMount: function() {
    this.loadWorld(this.props.world);
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.world !== nextProps.world) {
      this.loadWorld(nextProps.world);
    }
  },

  loadWorld: function(worldModel) {
    if (!worldModel) {
      return;
    }

    this.setState({
      worldModel: worldModel,
      worldSolution: worldModel.get('solution'),
      worldStepDefinitions: worldModel.getSteps()
    });
  },

  handleChange: function() {
    var solution = this.refs.solutionInput.getValue();
    var needsSave = solution != this.state.worldModel.get('solution');

    if (!needsSave) {
      var modelSteps = this.state.worldModel.getSteps();
      needsSave = modelSteps.length !== this.state.worldStepDefinitions.length;
      if (!needsSave) {
        this.state.worldStepDefinitions.forEach(function(stepDefinition, index) {
          if (stepDefinition !== modelSteps[index]) {
            needsSave = true;
          }
        });
      }
    }

    this.setState({
      worldSolution:solution,
      needsSave: needsSave
    })
  },

  handleChangeStep: function(index, event) {
    this.state.worldStepDefinitions[index] = event.target.value;
    this.setState({worldStepDefinitions:this.state.worldStepDefinitions});
    this.handleChange();
  },

  handleSave: function() {
    this.state.worldModel.set('solution', this.refs.solutionInput.getValue());
    this.state.worldModel.setSteps(this.state.worldStepDefinitions);
    this.setState({saving: true});
    this.state.worldModel.save(null, {
      success: function() {
        this.setState({saving: false, needsSave:false});
        this.props.onWorldChange(this.state.worldModel);
      }.bind(this)
    })
  },

  handleAddStep: function() {
    var worldStepDefinitions = this.state.worldStepDefinitions;
    worldStepDefinitions.push(worldStepDefinitions[worldStepDefinitions.length-1]);
    this.setState({
      worldStepDefinitions:worldStepDefinitions,
      currentStep: this.state.currentStep+1
    });
    this.handleChange();
  },

  handleRemoveStep: function(index) {
    if (index > 0) {
      var worldStepDefinitions = this.state.worldStepDefinitions;
      worldStepDefinitions.splice(index, 1);
      this.setState({
        worldStepDefinitions:worldStepDefinitions,
        currentStep: this.state.currentStep - 1
      });
      this.handleChange();
    }
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
              {this.state.saving ? "Saving..." : null}
              <div className="form-group">
                <label>Reference Solution</label>
                <CodeEditor ref="solutionInput" onChange={this.handleChange} defaultValue={this.state.worldSolution}/>
              </div>
              <div className="text-right">
                <Button onClick={this.handleSave} disabled={!this.state.needsSave} bsStyle={this.state.needsSave ? "primary" : "default"}>Save</Button>
              </div>
            </form>
          </div>
          <div className="worldPane col-md-8">
            <Button disabled={this.state.currentStep <= 0} onClick={this.handlePrevStep}>Prev Step</Button>
            <Button disabled={this.state.currentStep >= this.state.worldStepDefinitions.length - 1} onClick={this.handleNextStep}>Next Step</Button>
            <div key={index} className="row">
              <div className="col-md-6">
                <h6>
                  Step {index}
                  <Glyphicon onClick={this.handleRemoveStep.bind(this, index)} className="pull-right" glyph="remove"/>
                </h6>
                <CodeEditor onChange={this.handleChangeStep.bind(this, index)} className="form-control" value={definition}/>
              </div>
              <div className="col-md-6">
                <WorldCanvas worldDefinition={definition} />
              </div>
            </div>
            <Button onClick={this.handleAddStep}>Add Step</Button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = WorldDefinitionEditorPage;