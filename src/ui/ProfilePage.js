/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Panel = require('react-bootstrap').Panel
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Link = require('react-router').Link;
var Navigation = require('react-router').Navigation;
var Parse = require('parse').Parse;
var React = require('react');
var gravatar = require('gravatar');

var ProgramModel = require('../models/ProgramModel');
var TrackBadge = require('./TrackBadge');

require('./ProfilePage.css');
var ProfilePage = React.createClass({

  mixins: [Navigation],

  getInitialState: function() {
    return {
      user: null,
      programs: [],
      isLoading: true
    };
  },

  loadUser: function() {
    var query = new Parse.Query(Parse.User);
    this.setState({isLoading: true});
    query.equalTo('username', this.getParams().username);
    query.find({
      success: function(users) {
        if (users.length) {
          this.setState({user:users[0]});
        }
        var programQuery = new Parse.Query(ProgramModel);
        programQuery.equalTo('owner', users[0]);
        programQuery.include('world');
        programQuery.include('world.track');
        programQuery.find({
          success: function(programs) {
            this.setState({programs:programs, isLoading: false})
          }.bind(this)
        })
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadUser();
  },

  render: function() {
    if (this.state.isLoading) {
      return (<div>Loading...</div>);
    }
    var completedWorlds = [];
    var inProgressWorlds = [];
    this.state.programs.forEach(function(program) {
      var list = program.get('finished') ? completedWorlds : inProgressWorlds;
      list.push(
        <ListGroupItem>
          <TrackBadge key={program.id} track={program.get('world').get('track')} />
          &nbsp;
          <Link
            to="track"
            params={{trackId:program.get('world').get('track').id}}
            query={{worldId:program.get('world').id}}>
            {program.get('world').get('name')}
          </Link>
        </ListGroupItem>
      );
    });
    return (
      <div className="row ProfilePage">
        <div className="col-md-2">
          <img className="gravatar" src={gravatar.url(this.state.user.get('email'), {s:170})}/>
          <p>{this.state.user.get('username')}</p>
        </div>
        <div className="col-md-5">
          <div className="panel panel-default">
            <div className="panel-heading">
              Completed Worlds
            </div>
            <ListGroup>
              {completedWorlds}
            </ListGroup>
          </div>
        </div>
        <div className="col-md-5">
          <div className="panel panel-default">
            <div className="panel-heading">
              In Progress Worlds
            </div>
            <ListGroup>
              {inProgressWorlds}
            </ListGroup>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProfilePage;