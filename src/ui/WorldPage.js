/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Nav = require('react-bootstrap').Nav;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var Parse = require('parse').Parse;
var React = require('react');

var Markdown = require('./Markdown');

var WorldModel = require('../models/WorldModel');
var WorldCanvas = require('./WorldCanvas');

require('./WorldPage.css');
var WorldPage = React.createClass({

  mixins: [Navigation],

  getInitialState: function() {
    return {
      worldModel: null,
      worldDefinition: '',
      worldDescription: '',
      worldName: '',
      worldPublic: null,
      needsSave: false
    }
  },

  componentDidMount: function() {
    this.loadWorld(this.props.params.worldId);
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
          isLoading:false
        });
      }.bind(this),
      error: function(object, error) {
        alert("failed to load: "+error.code+" "+error.message);
      }.bind(this)
    });
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.params.worldId != this.props.params.worldId) {
      this.loadWorld(nextProps.params.worldId);
    }
  },

  handleChange: function() {
    var name = this.refs.nameInput.getDOMNode().value;
    var description = this.refs.descriptionInput.getDOMNode().value;
    var definition = this.refs.definitionInput.getDOMNode().value;
    var isPublic = this.refs.publicCheckbox.getChecked();

    var needsSave = (
      name != this.state.worldModel.get('name') ||
      definition != this.state.worldModel.get('definition') ||
      description != this.state.worldModel.get('description') ||
      isPublic != this.state.worldModel.get('public')
    );

    this.setState({
      worldName:name,
      worldDescription:description,
      worldDefinition:definition,
      worldPublic:isPublic,
      needsSave: needsSave
    })
  },

  handleSave: function() {
    this.state.worldModel.set('name', this.refs.nameInput.getDOMNode().value);
    this.state.worldModel.set('description', this.refs.descriptionInput.getDOMNode().value);
    this.state.worldModel.set('definition', this.refs.definitionInput.getDOMNode().value);
    this.state.worldModel.set('public', this.refs.publicCheckbox.getChecked())
    this.setState({saving: true});
    this.state.worldModel.save(null, {
      success: function() {
        this.setState({saving: false, needsSave:false});
      }.bind(this)
    })
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
        <div className="col-md-2"/>
        <div className="col-md-4">
          <h3>{this.state.worldName}</h3>
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
              <label>Description/Instructions</label>
              <textarea ref="descriptionInput" onChange={this.handleChange} className="form-control worldDescriptionInput" defaultValue={this.state.worldDescription}></textarea>
            </div>
            <div className="form-group">
              <label>World Definition</label>
              <textarea ref="definitionInput"
                onChange={this.handleChange}
                className="form-control worldDefinitionInput"
                defaultValue={this.state.worldModel.get('definition')} />
            </div>
            <Input type="checkbox" ref="publicCheckbox" onClick={this.handleChange} defaultChecked={this.state.worldModel.get('public')} label="Public?"/>
            <Button onClick={this.handleSave} className="pull-right" disabled={!this.state.needsSave} bsStyle={this.state.needsSave ? "primary" : "default"}>Save</Button>
            <ModalTrigger modal={deleteConfirmationModal}>
              <Button onClick={this.handleDelete} bsStyle="danger">Delete</Button>
            </ModalTrigger>
          </form>
        </div>
        <div className="worldPane col-md-8">
          <div className="row">
            <div className="col-md-6">
              <h3>{this.state.worldName}</h3>
              <Markdown>{this.state.worldDescription}</Markdown>
            </div>
            <div className="col-md-6">
              <WorldCanvas worldDefinition={this.state.worldDefinition} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = WorldPage;