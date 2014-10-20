/** @jsx React.DOM */
var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;

var LandingPage = React.createClass({
  render: function() {
    return (
      <div>
        hello there!
      </div>
    );
  }
});

var AnthrobotApp = React.createClass({
  render: function() {
  	console.log("active route handler is", this.props.activeRouteHandler);
    return (
      <div>
      	<h1 className="page-header">Arthrobots!</h1>

        {/* this is the important part */}
        {this.props.activeRouteHandler()}
      </div>
    );
  }
});

var routes = (
  <Routes location="history">
    <Route name="app" path="/" handler={AnthrobotApp}>
      <DefaultRoute handler={LandingPage}/>
    </Route>
  </Routes>
);

React.renderComponent(routes, document.body);