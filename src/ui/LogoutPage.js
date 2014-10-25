/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Parse = require('parse').Parse;
var React = require('react');

var LogoutPage = React.createClass({

  componentDidMount: function() {
    var currentUser = Parse.User.current();
    if (currentUser) {
      Parse.User.logOut();
    }
    window.setTimeout(function(){window.location="/";}, 1000);
  },

  render: function() {
    return (
      <div className="row loginPage">
        <div className="col-md-3"/>
        <div className="col-md-6">
          <div className="jumbotron">
            <h1>Goodbye!</h1>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LogoutPage;