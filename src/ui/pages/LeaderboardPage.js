/** @jsx React.DOM */

var Link = require('react-router').Link;
var RouteHandler = require('react-router').RouteHandler;
var React = require('react');
var gravatar = require('gravatar');
var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;

var LoadingBlock = require('../LoadingBlock');

var FBUtils = require('../../FBUtils');

require('./LeaderboardPage.css');
var LeaderboardPage = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("UserStore")],

  getStateFromFlux: function() {
    var store = this.getFlux().store("UserStore");
    return {
      leaderboard: store.getLeaderboard(),
      isLoading: store.isLoading()
    };
  },

  componentDidMount: function() {
    this.getFlux().actions.loadLeaderboard();
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