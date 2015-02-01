/** @jsx React.DOM */
var Fluxxor = require('fluxxor');
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

var TrackStore = require('./stores/TrackStore');
var WorldStore = require('./stores/WorldStore');
var ProgramStore = require('./stores/ProgramStore');
var UserStore = require('./stores/UserStore');

var LandingPage = require('./ui/pages/LandingPage');
var LoginPage = require('./ui/pages/LoginPage');
var LogoutPage = require('./ui/pages/LogoutPage');
var SignUpPage = require('./ui/pages/SignUpPage');
var BrowseWorldsPage = require('./ui/pages/BrowseWorldsPage');
var WorldPage = require('./ui/pages/WorldPage');
var WorldWrapperPage = require('./ui/pages/WorldWrapperPage');
var WorldDefinitionEditorPage = require('./ui/pages/WorldDefinitionEditorPage');
var TrackPage = require('./ui/pages/TrackPage');
var ArthrobotApp = require('./ui/ArthrobotApp');
var LoginAnonymouslyPage = require('./ui/pages/LoginAnonymouslyPage');
var ProfilePage = require('./ui/pages/ProfilePage');
var LeaderboardPage = require('./ui/pages/LeaderboardPage');
var AboutPage = require('./ui/pages/AboutPage');
var WorldDetailsEditorPage = require('./ui/pages/WorldDetailsEditorPage');

var Empty = React.createClass({

  mixins: [State],

  render: function() {
    return <RouteHandler {...this.props}/>;
  }
});

var routes = (
  <Route name="app" path="/" handler={ArthrobotApp}>
    <Route name="worlds" path="/worlds" handler={Empty}>
      <Route name="world-wrapper" path="/worlds/:worldId" handler={WorldWrapperPage}>
        <Route name="world-definition-editor" path="/worlds/:worldId/builder" handler={WorldDefinitionEditorPage} />
        <Route name="world-details-editor" path="/worlds/:worldId/details" handler={WorldDetailsEditorPage} />
        <DefaultRoute name="world" handler={WorldPage} />
      </Route>
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

var stores = {
  TrackStore: new TrackStore(),
  WorldStore: new WorldStore(),
  ProgramStore: new ProgramStore(),
  UserStore: new UserStore()
};
var actions = require('./actions/Actions');
var flux = new Fluxxor.Flux(stores, actions);
flux.on("dispatch", function(type, payload) {
  if (console && console.log) {
    console.log("[Dispatch]", type, payload);
  }
});

Router.run(routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler flux={flux}/>, document.body);
});
