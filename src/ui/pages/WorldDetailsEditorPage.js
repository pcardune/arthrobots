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

var WorldModel = require('../../models/WorldModel');
var WorldStore = require('../../stores/WorldStore');
var WorldCanvas = require('../WorldCanvas');

require('./WorldDetailsEditorPage.css');
var WorldDetailsEditorPage = React.createClass({

  mixins: [Navigation, State, FluxMixin, StoreWatchMixin("WorldStore")],

  getDefaultProps: function() {
    return {world: null};
  },

  getStateFromFlux: function() {
    var store = this.getFlux().store("WorldStore");
    var worldModel = store.getWorld(this.props.world.id);
    return {
      worldModel:worldModel,
      worldName:worldModel.get('name'),
      worldDescription:worldModel.get('description'),
      worldPublic:worldModel.get('public'),
      worldTrack:worldModel.get('track'),
      worldOrder:worldModel.get('order'),
      saving: store.isLoading()
    };
  },

  getInitialState: function() {
    return {needsSave: false};
  },

  componentDidMount: function() {
    this.getFlux().store("WorldStore").on('destroy_success', this._onDestroy);
  },

  componentWillUnmount: function() {
    this.getFlux().store("WorldStore").removeListener('destroy_success', this._onDestroy);
  },

  _onDestroy: function(world) {
    window.setTimeout(function() {
      this.transitionTo('worlds');
    }.bind(this));
  },

  handleChange: function() {
    var name = this.refs.nameInput.getDOMNode().value;
    var description = this.refs.descriptionInput.getDOMNode().value;
    var isPublic = this.refs.publicCheckbox.getChecked();
    var track = this.refs.trackInput.getValue();
    var order = parseInt(this.refs.orderInput.getDOMNode().value);

    var needsSave = (
      name != this.state.worldModel.get('name') ||
      description != this.state.worldModel.get('description') ||
      isPublic != this.state.worldModel.get('public') ||
      order != this.state.worldModel.get('order') ||
      (track && track.id) != this.state.worldModel.get('track') && this.state.worldModel.get('track').id
    );

    this.setState({
      worldName:name,
      worldDescription:description,
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
    this.getFlux().actions.saveWorld(
      {
        name: this.refs.nameInput.getDOMNode().value,
        description: this.refs.descriptionInput.getDOMNode().value,
        "public": this.refs.publicCheckbox.getChecked(),
        track: this.refs.trackInput.getValue(),
        order: parseInt(this.refs.orderInput.getDOMNode().value)
      },
      this.state.worldModel
    );
  },

  handleDeleteWorld: function() {
    this.getFlux().actions.destroyWorld(this.state.worldModel);
  },

  render: function() {
    if (this.state.isLoading || !this.state.worldModel) {
      return <div>loading...</div>;
    }

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
      <div className="WorldDetailsEditorPage">
        <div className="row">
          <div className="col-md-6">
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
                <label>Level</label>
                <input ref="orderInput" onChange={this.handleChange} type="text" className="form-control" defaultValue={this.state.worldOrder}/>
              </div>
              <div className="form-group">
                <label>Description/Instructions</label>
                <textarea ref="descriptionInput" onChange={this.handleChange} className="form-control worldDescriptionInput" defaultValue={this.state.worldDescription}></textarea>
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
          <div className="worldPane col-md-6">
            <h3>Level {this.state.worldOrder} - {this.state.worldName}</h3>
            <Markdown>{this.state.worldDescription}</Markdown>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = WorldDetailsEditorPage;