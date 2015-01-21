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

require('./WorldPage.css');
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
      worldDefinition: '',
      worldSolution: '',
      needsSave: false,
      worldStepDefinitions: []
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
      worldModel:worldModel,
      worldDefinition:worldModel.get('definition'),
      worldSolution:worldModel.get('solution'),
      worldStepDefinitions:worldModel.get('steps') || [],
    });
  },

  handleChange: function() {
    var solution = this.refs.solutionInput.getValue();
    var definition = this.refs.definitionInput.getValue();

    var needsSave = (
      definition != this.state.worldModel.get('definition') ||
      solution != this.state.worldModel.get('solution')
    );

    if (!needsSave) {
      var modelSteps = this.state.worldModel.get('steps');
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
      worldDefinition:definition,
      needsSave: needsSave
    })
  },

  handleChangeStep: function(index, event) {
    this.state.worldStepDefinitions[index] = event.target.value;
    var modelSteps = this.state.worldModel.get('steps');
    this.setState({worldStepDefinitions:this.state.worldStepDefinitions});
    this.handleChange();
  },

  handleSave: function() {
    this.state.worldModel.set('solution', this.refs.solutionInput.getValue());
    this.state.worldModel.set('definition', this.refs.definitionInput.getValue());
    this.state.worldModel.set('steps', this.state.worldStepDefinitions);
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
    if (worldStepDefinitions.length == 0) {
      worldStepDefinitions.push(this.state.worldDefinition);
    } else {
      worldStepDefinitions.push(worldStepDefinitions[worldStepDefinitions.length-1]);
    }
    this.setState({worldStepDefinitions:worldStepDefinitions});
    this.handleChange();
  },

  handleRemoveStep: function(index) {
    var worldStepDefinitions = this.state.worldStepDefinitions;
    worldStepDefinitions.splice(index, 1);
    this.setState({worldStepDefinitions:worldStepDefinitions});
    this.handleChange();
  },

  render: function() {
    if (this.state.isLoading || !this.state.worldModel) {
      return <div>loading...</div>;
    }

    var stepCanvases = this.state.worldStepDefinitions.map(function(step, index) {
      return (
        <div key={index} className="row">
          <div className="col-md-6">
            <h6>
              Step {index+1}
              <Glyphicon onClick={this.handleRemoveStep.bind(this, index)} className="pull-right" glyph="remove"/>
            </h6>
            <CodeEditor onChange={this.handleChangeStep.bind(this, index)} className="form-control" value={step}/>
          </div>
          <div className="col-md-6">
            <WorldCanvas worldDefinition={step} />
          </div>
        </div>
      );
    }.bind(this));
    return (
      <div className="WorldPage">
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
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>World Definition</label>
                  <CodeEditor ref="definitionInput"
                    onChange={this.handleChange}
                    defaultValue={this.state.worldModel.get('definition')} />
                </div>
              </div>
              <div className="col-md-6">
                <WorldCanvas worldDefinition={this.state.worldDefinition} />
              </div>
            </div>
            {stepCanvases}
            <Button onClick={this.handleAddStep}>Add Step</Button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = WorldDefinitionEditorPage;