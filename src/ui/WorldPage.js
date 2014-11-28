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
var Parse = require('parse').Parse;
var React = require('react');

var Markdown = require('./Markdown');
var CodeEditor = require('./CodeEditor');
var TrackDropdown = require('./TrackDropdown');

var WorldModel = require('../models/WorldModel');
var WorldCanvas = require('./WorldCanvas');

require('./WorldPage.css');
var WorldPage = React.createClass({

  mixins: [Navigation, State],

  getInitialState: function() {
    return {
      worldModel: null,
      worldDefinition: '',
      worldDescription: '',
      worldOrder: 0,
      worldName: '',
      worldPublic: null,
      worldTrack: null,
      needsSave: false,
      worldStepDefinitions: []
    }
  },

  componentDidMount: function() {
    this.loadWorld(this.getParams().worldId);
  },

  loadWorld: function(worldId) {
    if (!worldId) {
      return;
    }
    var query = new Parse.Query(WorldModel);
    this.setState({isLoading:true})
    query.get(worldId, {
      success: function(worldModel) {
        this.setState({
          worldModel:worldModel,
          worldName:worldModel.get('name'),
          worldDescription:worldModel.get('description'),
          worldDefinition:worldModel.get('definition'),
          worldPublic:worldModel.get('public'),
          worldTrack:worldModel.get('track'),
          worldOrder:worldModel.get('order'),
          worldStepDefinitions:worldModel.get('steps') || [],
          isLoading:false
        });
      }.bind(this),
      error: function(object, error) {
        alert("failed to load: "+error.code+" "+error.message);
      }.bind(this)
    });
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.params.worldId != this.getParams().worldId) {
      this.loadWorld(nextProps.params.worldId);
    }
  },

  handleChange: function() {
    var name = this.refs.nameInput.getDOMNode().value;
    var description = this.refs.descriptionInput.getDOMNode().value;
    var definition = this.refs.definitionInput.getDOMNode().value;
    var isPublic = this.refs.publicCheckbox.getChecked();
    var track = this.refs.trackInput.getValue();
    var order = parseInt(this.refs.orderInput.getDOMNode().value);

    var needsSave = (
      name != this.state.worldModel.get('name') ||
      definition != this.state.worldModel.get('definition') ||
      description != this.state.worldModel.get('description') ||
      isPublic != this.state.worldModel.get('public') ||
      order != this.state.worldModel.get('order') ||
      (track && track.id) != this.state.worldModel.get('track') && this.state.worldModel.get('track').id
    );

    if (!needsSave) {
      var modelSteps = this.state.worldModel.get('steps');
      needsSave = modelSteps.length !== this.state.worldStepDefinitions.length;
      console.log("# steps", modelSteps.length, this.state.worldStepDefinitions.length)
      if (!needsSave) {
        this.state.worldStepDefinitions.forEach(function(stepDefinition, index) {
          console.log("comparing", stepDefinition, "to", modelSteps[index]);
          if (stepDefinition !== modelSteps[index]) {
            needsSave = true;
          }
        });
      }
    }

    this.setState({
      worldName:name,
      worldDescription:description,
      worldDefinition:definition,
      worldPublic:isPublic,
      worldTrack:track,
      worldOrder:order,
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
    this.state.worldModel.set('name', this.refs.nameInput.getDOMNode().value);
    this.state.worldModel.set('description', this.refs.descriptionInput.getDOMNode().value);
    this.state.worldModel.set('definition', this.refs.definitionInput.getDOMNode().value);
    this.state.worldModel.set('public', this.refs.publicCheckbox.getChecked());
    this.state.worldModel.set('track', this.refs.trackInput.getValue());
    this.state.worldModel.set('order', parseInt(this.refs.orderInput.getDOMNode().value));
    this.state.worldModel.set('steps', this.state.worldStepDefinitions);
    this.setState({saving: true});
    this.state.worldModel.save(null, {
      success: function() {
        this.setState({saving: false, needsSave:false});
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

  handleDeleteWorld: function() {
    this.state.worldModel.destroy({
      success: function(world) {
        this.transitionTo('worlds');
      }.bind(this),
      error: function(world, error) {
        alert("There was an error while deleting the world: "+error.code+" "+error.message);
      }.bind(this)
    })
    this.goBack();
  },

  isEditable: function() {
    return this.state.worldModel.get('owner').id == Parse.User.current().id;
  },

  render: function() {
    if (this.state.isLoading || !this.state.worldModel) {
      return <div>loading...</div>;
    }

    var content;
    if (this.isEditable()) {
      content = this.renderEditableWorldPane();
    } else {
      content = this.renderWorldPane();
    }

    return (
      <div className="WorldPage">
        {content}
      </div>
    );
  },

  renderWorldPane: function() {
    return (
      <div className="row">
        <h3>{this.state.worldName}</h3>
        <div className="col-md-2"/>
        <div className="col-md-4">
          <Markdown>{this.state.worldDescription}</Markdown>
        </div>
        <div className="col-md-4">
          <WorldCanvas worldDefinition={this.state.worldDefinition} />
        </div>
      </div>
    );
  },

  renderEditableWorldPane: function() {
    var deleteConfirmationModal = (
      <Modal title="Delete World?" animation={false}>
        <div className="modal-body">
          Are you sure you want to delete this world? This cannot be undone.
        </div>
        <div className="modal-footer">
          <Button bsStyle="danger" onClick={this.handleDeleteWorld}>Delete World</Button>
        </div>
      </Modal>
      );
    var stepFields = this.state.worldStepDefinitions.map(function(step, index) {
      return (
        <div>
          <h6>
            Step {index+1}
            <Glyphicon onClick={this.handleRemoveStep.bind(this, index)} className="pull-right" glyph="remove"/>
          </h6>
          <CodeEditor onChange={this.handleChangeStep.bind(this, index)} className="form-control" value={step}/>
        </div>
      );
    }.bind(this));
    var stepCanvases = this.state.worldStepDefinitions.map(function(step, index) {
      return <div>
        <h6>Step {index+1}</h6>
        <WorldCanvas worldDefinition={step} />
      </div>
    });
    return (
      <div className="row">
        <div className="col-md-4">
          <form>
            {this.state.saving ? "Saving..." : null}
            <div className="form-group">
              <label>World Name</label>
              <input ref="nameInput" onChange={this.handleChange} type="text" className="form-control" placeholder="world name" defaultValue={this.state.worldName}/>
            </div>
            <div className="form-group">
              <label>Track</label>
              <TrackDropdown ref="trackInput" onChange={this.handleChange} defaultValue={this.state.worldTrack}/>
            </div>
            <div className="form-group">
              <label>Order in Track</label>
              <input ref="orderInput" onChange={this.handleChange} type="text" className="form-control" defaultValue={this.state.worldOrder}/>
            </div>
            <div className="form-group">
              <label>Description/Instructions</label>
              <textarea ref="descriptionInput" onChange={this.handleChange} className="form-control worldDescriptionInput" defaultValue={this.state.worldDescription}></textarea>
            </div>
            <div className="form-group">
              <label>World Definition</label>
              <CodeEditor ref="definitionInput"
                onChange={this.handleChange}
                defaultValue={this.state.worldModel.get('definition')} />
            </div>
            <div className="form-group">
              <label>Steps</label>
              <br />
              {stepFields}
              <Button onClick={this.handleAddStep}>Add Step</Button>
            </div>
            <div className="form-group">
              <label>Privacy</label>
              <Input
                type="checkbox"
                ref="publicCheckbox"
                onClick={this.handleChange}
                defaultChecked={this.state.worldModel.get('public')}
                label="Visible to anyone"/>
            </div>
            <Button onClick={this.handleSave} className="pull-right" disabled={!this.state.needsSave} bsStyle={this.state.needsSave ? "primary" : "default"}>Save</Button>
            <ModalTrigger modal={deleteConfirmationModal}>
              <Button onClick={this.handleDelete} bsStyle="danger">Delete</Button>
            </ModalTrigger>
          </form>
        </div>
        <div className="worldPane col-md-8">
          <div className="row">
            <h3>{this.state.worldName}</h3>
            <div className="col-md-6">
              <Markdown>{this.state.worldDescription}</Markdown>
            </div>
            <div className="col-md-6">
              <WorldCanvas worldDefinition={this.state.worldDefinition} />
              {stepCanvases}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = WorldPage;