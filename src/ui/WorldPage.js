/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Navigation = require('react-router').Navigation;
var Nav = require('react-bootstrap').Nav;
var Navbar = require('react-bootstrap').Navbar;
var Parse = require('parse').Parse;
var React = require('react');

var Tab = require('./Tab');

var WorldModel = require('../models/WorldModel');
var WorldCanvas = require('./WorldCanvas');

var WorldPage = React.createClass({

  mixins: [Navigation],

  getInitialState: function() {
    return {
      worldModel: null
    }
  },

  componentDidMount: function() {
    this.loadWorld(this.props.params.worldId);
  },

  loadWorld: function(worldId) {
    console.log('loading', worldId);
    if (!worldId) {
      return;
    }
    var query = new Parse.Query(WorldModel);
    this.setState({isLoading:true})
    query.get(worldId, {
      success: function(worldModel) {
        this.setState({
          worldModel:worldModel,
          worldDefinition:worldModel.get('definition'),
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

  handleDefinitionChange: function() {
    this.setState({worldDefinition:this.refs.definitionInput.getDOMNode().value})
  },

  handleSave: function() {
    this.state.worldModel.set('name', this.refs.nameInput.getDOMNode().value);
    this.state.worldModel.set('description', this.refs.descriptionInput.getDOMNode().value);
    this.state.worldModel.set('definition', this.refs.definitionInput.getDOMNode().value);
    this.setState({saving: true});
    this.state.worldModel.save(null, {
      success: function() {
        this.setState({saving: false});
      }.bind(this)
    })
  },

  render: function() {
    if (this.state.isLoading || !this.state.worldModel) {
      return <div>loading...</div>;
    }
    return (
      <div className="row">
        <div className="col-md-7">
          <WorldCanvas worldDefinition={this.state.worldDefinition} />
        </div>
        <div className="col-md-5">
          <form>
            {this.state.saving ? "Saving..." : null}
            <div className="form-group">
              <label>World Name</label>
              <input ref="nameInput" type="text" className="form-control" placeholder="world name" defaultValue={this.state.worldModel.get('name')}/>
            </div>
            <div className="form-group">
              <label>Description/Instructions</label>
              <textarea ref="descriptionInput" className="form-control" defaultValue={this.state.worldModel.get('description')}></textarea>
            </div>
            <div className="form-group">
              <label>World Definition</label>
              <textarea ref="definitionInput"
                onChange={this.handleDefinitionChange}
                className="form-control"
                defaultValue={this.state.worldModel.get('definition')} />
            </div>
            <Button onClick={this.handleSave}>Save</Button>
          </form>
        </div>
      </div>
    );
  }
});

module.exports = WorldPage;