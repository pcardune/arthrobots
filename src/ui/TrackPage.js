/** @jsx React.DOM */
var ActiveState = require('react-router').ActiveState;
var Button = require('react-bootstrap').Button;
var Link = require('react-router').Link;
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var Parse = require('parse').Parse;
var React = require('react');

var Tab = require('./Tab');
var Markdown = require('./Markdown');
var WorldCanvas = require('./WorldCanvas');
var ProgramEditor = require('./ProgramEditor');

var WorldModel = require('../models/WorldModel');
var TrackModel = require('../models/TrackModel');

var TrackPage = React.createClass({

  mixins: [Navigation, ActiveState],

  getInitialState: function() {
    return {
      trackModel: null,
      worldModels: [],
      currentWorld: null,
      isLoading: true,
    };
  },

  loadTrackAndWorlds: function() {
    var query = new Parse.Query(TrackModel);
    this.setState({isLoading: true});
    query.get(this.props.params.trackId, {
      success: function(trackModel) {
        this.setState({
          trackModel:trackModel
        });
        var query = new Parse.Query(WorldModel);
        query.equalTo('track', trackModel);
        query.equalTo('public', true);
        query.find({
          success: function(worldModels) {
            this.setState({
              worldModels: worldModels,
              isLoading: false,
              currentWorld: worldModels[0]
            });
          }.bind(this)
        })
      }.bind(this),
      error: function() {
        alert("failed to fetch track:"+error.code+" "+error.message);
      }.bind(this)
    })
  },

  componentDidMount: function() {
    this.loadTrackAndWorlds();
  },

  setCurrentWorld: function(world) {
    this.setState({currentWorld:world});
  },

  render: function() {
    if (this.state.isLoading) {
      return <div>loading...</div>;
    }
    var worldList = this.state.worldModels.map(function(world, index){
      return (
        <li key={world.id} className={world.id == this.state.currentWorld.id ? "active":""}
            onClick={this.setCurrentWorld.bind(this, world)}>
          <a href="#">({index+1}) {world.get('name')}</a>
        </li>
      );
    }.bind(this));

    return (
      <div>
        <h6 className="pull-right">{this.state.trackModel.get('name')}</h6>
        <nav>
          <ul className="pagination">
            {worldList}
          </ul>
        </nav>
        <h3>{this.state.currentWorld.get('name')}</h3>
        <div className="row">
          <div className="col-md-4">
            <Markdown>{this.state.currentWorld.get('description')}</Markdown>
          </div>
          <div className="col-md-8">
            <ProgramEditor worldModel={this.state.currentWorld} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TrackPage;