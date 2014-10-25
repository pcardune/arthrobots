/** @jsx React.DOM */

var ActiveState = require('react-router').ActiveState;
var Parse = require('parse').Parse;
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Tab = require('./Tab');

require('./ArthrobotApp.css')

var ArthrobotApp = React.createClass({

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

module.exports = ArthrobotApp;