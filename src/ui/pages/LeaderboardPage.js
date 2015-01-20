/** @jsx React.DOM */

var Link = require('react-router').Link;
var RouteHandler = require('react-router').RouteHandler;
var React = require('react');
var gravatar = require('gravatar');

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var LoadingBlock = require('../LoadingBlock');

var FBUtils = require('../../FBUtils');

require('./LeaderboardPage.css');
var LeaderboardPage = React.createClass({

  getInitialState: function() {
    return {
      isLoading: true,
      leaderboard: []
    };
  },

  loadLeaderboard: function() {
    this.setState({isLoading: true});
    var query = new Parse.Query(Parse.User);
    query.descending("programsFinished");
    query.limit(20);
    query.find({
      success: function(users) {
        this.setState({isLoading:false, leaderboard:users});
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadLeaderboard();
  },

  render: function() {
    if (this.state.isLoading) {
      return <LoadingBlock/>;
    }
    var leaderboard = this.state.leaderboard.map(function(user) {
      return (
        <tr>
          <td>
            <Link to="profile" params={{userId:user.id}}>
              <img className="gravatar" src={FBUtils.getProfilePic(user)}/>
              {FBUtils.getUserName(user)}
            </Link>
          </td>
          <td>
            {user.get('programsFinished')}
          </td>
        </tr>
      );
    });
    return (
      <div className="row LeaderboardPage">
        <div className="col-md-3">
        </div>
        <div className="col-md-6">
          <h1>Leaderboard</h1>
          <div className="panel panel-default">
          <table className="table">
            <thead>
              <tr>
                <th>Programmer</th>
                <th># Programs Completed</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LeaderboardPage;