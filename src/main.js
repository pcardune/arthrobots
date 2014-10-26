/** @jsx React.DOM */

var Parse = require('parse').Parse;
var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
var ActiveState = Router.ActiveState;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;

var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Button = ReactBootstrap.Button;

var LandingPage = require('./ui/LandingPage');
var LoginPage = require('./ui/LoginPage');
var LogoutPage = require('./ui/LogoutPage');
var SignUpPage = require('./ui/SignUpPage');
var BrowseWorldPage = require('./ui/BrowseWorldPage');
var WorldPage = require('./ui/WorldPage');
var ArthrobotApp = require('./ui/ArthrobotApp');

var ParseKeys = require('./ParseKeys');
Parse.initialize(ParseKeys.APP_ID, ParseKeys.JS_KEY);

var ProgramPage = React.createClass({
  render: function() {
    return (
      <div>
        Doing some programming
      </div>
    );
  }
});

var routes = (
  <Routes location="history">
    <Route name="app" path="/" handler={ArthrobotApp}>
      <Route name="worlds" handler={BrowseWorldPage} />
      <Route name="world" path="/worlds/:worldId" handler={WorldPage} />
      <Route name="program" handler={ProgramPage} />
      <Route name="login" handler={LoginPage} />
      <Route name="logout" handler={LogoutPage} />
      <Route name="signup" handler={SignUpPage} />
      <DefaultRoute name="landing" handler={LandingPage}/>
    </Route>
  </Routes>
);

React.renderComponent(routes, document.body);