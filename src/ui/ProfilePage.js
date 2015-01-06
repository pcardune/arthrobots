/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Panel = require('react-bootstrap').Panel
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Link = require('react-router').Link;
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;
var React = require('react');
var gravatar = require('gravatar');

var ProgramModel = require('../models/ProgramModel');
var TrackBadge = require('./TrackBadge');
var FBUtils = require('../FBUtils');

var LinkFacebookButton = React.createClass({

  getInitialState: function() {
    return {
      isConnecting: false,
      isDisconnecting: false,
      isLinked: Parse.User.current() && Parse.FacebookUtils.isLinked(Parse.User.current())
    }
  },

  handleConnectToFacebook: function(event) {
    this.setState({isConnecting:true})
    FBUtils.linkAccount({
      success:function() {
        this.setState(this.getInitialState());
      }.bind(this)
    });
  },

  handleUnlinkFacebook: function() {
    this.setState({isDisconnecting: true});
    Parse.FacebookUtils.unlink(Parse.User.current(), {
      success: function(user) {
        user.set('fbProfile', null);
        user.save(null, {
          success: function() {
            this.setState(this.getInitialState());
          }.bind(this)
        })
      }.bind(this)
    })
  },

  render: function() {
    if (this.state.isLinked) {
      if (this.state.isDisconnecting) {
        return <Button>Disconnecting...</Button>;
      }
      return <Button onClick={this.handleUnlinkFacebook}>Disconnect from Facebook</Button>;
    } else {
      if (this.state.isConnecting) {
        return <Button bsStyle="primary">Connecting...</Button>
      }
      return <Button bsStyle="primary" onClick={this.handleConnectToFacebook}>Connect to Facebook</Button>
    }
  }
});

var dedupeAndSortPrograms = function(programs) {
  var programsByWorld = {};
  programs.forEach(function(program) {
    var key = program.get('world').id;
    if (!programsByWorld[key]) {
      programsByWorld[key] = program
    } else if (program.get('finished')) {
      programsByWorld[key] = program
    }
  });
  var dedupedPrograms = [];
  for (var key in programsByWorld) {
    if (programsByWorld.hasOwnProperty(key)) {
      dedupedPrograms.push(programsByWorld[key]);
    }
  }
  return dedupedPrograms.sort(function(a,b) {return a.createdAt - b.createdAt;});
}

require('./ProfilePage.css');
var ProfilePage = React.createClass({

  mixins: [Navigation, State],

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
    query.equalTo('objectId', this.getParams().userId);
    query.find({
      success: function(users) {
        if (users.length) {
          this.setState({user:users[0]});
          var programQuery = new Parse.Query(ProgramModel);
          programQuery.equalTo('owner', users[0]);
          programQuery.include('world');
          programQuery.include('world.track');
          programQuery.find({
            success: function(programs) {
              this.setState({programs:dedupeAndSortPrograms(programs), isLoading: false});
            }.bind(this)
          });
        }
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
        <ListGroupItem key={program.id}>
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
    var  connectToFB = null;
    if (Parse.User.current() && Parse.User.current().id == this.state.user.id) {
      connectToFB = <LinkFacebookButton />;
    }
    var profilePic = FBUtils.getProfilePic(this.state.user);
    return (
      <div className="row ProfilePage">
        <div className="col-md-2">
          <img className="gravatar" src={profilePic}/>
          <p>{FBUtils.getUserName(this.state.user)}</p>
          {connectToFB}
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