/** @jsx React.DOM */

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var State = Router.State;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;

var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Button = ReactBootstrap.Button;

var LandingPage = require('./ui/pages/LandingPage');
var LoginPage = require('./ui/pages/LoginPage');
var LogoutPage = require('./ui/pages/LogoutPage');
var SignUpPage = require('./ui/pages/SignUpPage');
var BrowseWorldsPage = require('./ui/pages/BrowseWorldsPage');
var WorldPage = require('./ui/pages/WorldPage');
var TrackPage = require('./ui/pages/TrackPage');
var ArthrobotApp = require('./ui/ArthrobotApp');
var LoginAnonymouslyPage = require('./ui/pages/LoginAnonymouslyPage');
var ProfilePage = require('./ui/pages/ProfilePage');
var LeaderboardPage = require('./ui/pages/LeaderboardPage');
var AboutPage = require('./ui/pages/AboutPage');

var Empty = React.createClass({

  mixins: [State],

  render: function() {
    return <RouteHandler/>;
  }
});

var routes = (
  <Route name="app" path="/" handler={ArthrobotApp}>
    <Route name="worlds" path="/worlds" handler={Empty}>
      <Route name="world" path="/worlds/:worldId" handler={WorldPage} />
      <DefaultRoute name="browseworlds" handler={BrowseWorldsPage} />
    </Route>
    <Route name="profile" path="/profile/:userId" handler={ProfilePage} />
    <Route name="track" path="/tracks/:trackId" handler={TrackPage} />
    <Route name="login" handler={LoginPage} />
    <Route name="login-anonymously" handler={LoginAnonymouslyPage} />
    <Route name="logout" handler={LogoutPage} />
    <Route name="signup" handler={SignUpPage} />
    <Route name="leaderboard" handler={LeaderboardPage} />
    <Route name="about" handler={AboutPage} />
    <DefaultRoute name="landing" handler={LandingPage}/>
  </Route>
);


Router.run(routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.body);
});
