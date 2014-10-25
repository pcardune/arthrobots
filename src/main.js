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
var ArthrobotApp = require('./ui/ArthrobotApp');

var ParseKeys = require('./ParseKeys');
Parse.initialize(ParseKeys.APP_ID, ParseKeys.JS_KEY);

var BrowsePage = React.createClass({
  render: function() {
    return (
      <div>
        doing some browsing
      </div>
    );
  }
});

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
      <Route name="browse" handler={BrowsePage} />
      <Route name="program" handler={ProgramPage} />
      <DefaultRoute name="landing" handler={LandingPage}/>
    </Route>
  </Routes>
);

React.renderComponent(routes, document.body);