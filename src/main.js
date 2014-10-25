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

var Tab = React.createClass({

  mixins: [ActiveState],

  render: function() {
    var isActive = this.isActive(this.props.to, this.props.params, this.props.query);
    var className = isActive ? 'active' : '';
    var link = Link(this.props);
    return <li className={className}>{link}</li>;
  }

});

require('./AnthrobotApp.css')
var AnthrobotApp = React.createClass({

  mixins: [ActiveState],

  render: function() {
    return (
      <div className="container">
        <h1 className="page-header">Arthrobots!</h1>
        <ul className="nav nav-tabs">
          <Tab to="landing">Home</Tab>
          <Tab to="browse">Browse</Tab>
          <Tab to="program">Program</Tab>
        </ul>

        <div className="row">
          <div className="col-md-12 app-content">
            {this.props.activeRouteHandler()}
          </div>
        </div>
      </div>
    );
  }
});

var routes = (
  <Routes location="history">
    <Route name="app" path="/" handler={AnthrobotApp}>
      <Route name="browse" handler={BrowsePage} />
      <Route name="program" handler={ProgramPage} />
      <DefaultRoute name="landing" handler={LandingPage}/>
    </Route>
  </Routes>
);

React.renderComponent(routes, document.body);