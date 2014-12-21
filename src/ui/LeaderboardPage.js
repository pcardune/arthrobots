/** @jsx React.DOM */

var Link = require('react-router').Link;
var RouteHandler = require('react-router').RouteHandler;
var React = require('react');
var gravatar = require('gravatar');

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;

var FBUtils = require('../FBUtils');

var LeaderboardPage = React.createClass({

  getInitialState: function() {
    return {
      isLoading: true,
      leaderboard: []
    };
  },

  loadLeaderboard: function() {
    this.setState({isLoading: true});
    Parse.Cloud.run('getLeaderboard', {num:20}, {success:function(leaderboard) {
      var userIds = leaderboard.map(function(item){ return item.owner; });
      var userQuery = new Parse.Query(Parse.User);
      userQuery.containedIn("objectId", userIds);
      userQuery.find({success:function(users) {
        var usersById = {};
        users.forEach(function(user) {
          usersById[user.id] = user;
        });
        leaderboard = leaderboard.map(function(item) {
          return {owner:usersById[item.owner], programCount:item.programCount};
        });
        this.setState({isLoading:false, leaderboard:leaderboard});
      }.bind(this)});
    }.bind(this)})
  },

  componentDidMount: function() {
    this.loadLeaderboard();
  },

  render: function() {
    if (this.state.isLoading) {
      return (<div>Loading...</div>);
    }
    var leaderboard = this.state.leaderboard.map(function(item) {
      if (!item.owner) {
        return null;
      }
      return (
        <div>
          <Link to="profile" params={{userId:item.owner.id}}>
            <span>{item.programCount}</span> - <span>{item.owner ? FBUtils.getUserName(item.owner) : "?"}</span>
          </Link>
        </div>
      );
    });
    return (
      <div className="row LeaderboardPage">
        <div className="col-md-3">
        </div>
        <div className="col-md-6">
          <h1>Leaderboard</h1>
          <div>
            {leaderboard}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LeaderboardPage;