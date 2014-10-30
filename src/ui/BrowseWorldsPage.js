/** @jsx React.DOM */
var ActiveState = require('react-router').ActiveState;
var Button = require('react-bootstrap').Button;
var Link = require('react-router').Link;
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Nav = require('react-bootstrap').Nav;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var Parse = require('parse').Parse;
var React = require('react');

var Tab = require('./Tab');

var WorldModel = require('../models/WorldModel');

var BrowseWorldsPage = React.createClass({

  mixins: [Navigation, ActiveState],

  getInitialState: function() {
    return {
      worldModels:[],
      isLoading: false
    };
  },

  handleCreateNewWorld: function() {
    var world = new WorldModel();
    world.set('owner', Parse.User.current());
    world.set('name', this.refs.worldNameInput.getDOMNode().value);
    world.save(null, {
      success: function(world) {
        // Execute any logic that should take place after the object is saved.
        this.transitionTo('world', {worldId: world.id})
      }.bind(this),
      error: function(gameScore, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        alert('Failed to create new world, with error code: ' + error.message);
      }.bind(this)
    });
  },

  loadWorldModels: function() {
    this.setState({isLoading:true});
    var query = new Parse.Query(WorldModel);
    query.equalTo("owner", Parse.User.current());
    query.find({
      success: function(worldModels) {
        this.setState({
          isLoading: false,
          worldModels: worldModels
        })
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadWorldModels();
  },

  render: function() {
    var worldLinks = this.state.worldModels.map(function(worldModel) {
      return (
        <Link className="list-group-item" to="world" params={{worldId:worldModel.id}}>
          <h4>{worldModel.get('name')}</h4>
          <p>{worldModel.get('description')}</p>
        </Link>
      );
    });

    var createWorldModal = (
      <Modal title="Create World" animation={false}>
        <div className="modal-body">
          <div className="form-group">
            <label>World Name</label>
            <input ref="worldNameInput" type="text" className="form-control" placeholder="World Name" />
          </div>
          <div className="modal-footer">
            <Button>Cancel</Button>
            <Button onClick={this.handleCreateNewWorld} bsStyle="primary">Create World</Button>
          </div>
        </div>
      </Modal>
    );

    return (
      <div className="row loginPage">
        <div className="col-md-12">
          <Navbar fluid={true}>
            <Nav>
              <Tab to="landing">Your Worlds</Tab>
              <Tab to="landing">All Worlds</Tab>
            </Nav>
          </Navbar>
          {this.state.isLoading ? "Loading..." : null}
          <ListGroup>
            {worldLinks}
          </ListGroup>
          <ModalTrigger modal={createWorldModal}>
            <Button bsStyle="primary">Create New World</Button>
          </ModalTrigger>
        </div>
      </div>
    );
  }
});

module.exports = BrowseWorldsPage;