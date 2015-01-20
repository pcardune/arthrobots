/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Link = require('react-router').Link;
var React = require('react');
var UserUtils = require('../../UserUtils');

var LoginAnonymouslyPage = React.createClass({

  getInitialState: function() {
    return {
      message: "",
      messageType: ""
    }
  },

  handleLoginAnonymously: function() {
    this.setState({
      message:"Working...",
      messageType:"info"
    });
    UserUtils.loginAnonymousUser({
      success: function() {
        window.location = "/";
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        this.setState({
          message:"There was an error while signing you up: "+error.code+" "+error.message,
          messageType:"danger"
        });
      }.bind(this)
    });
  },

  render: function() {
    var alert = null;
    if (this.state.message) {
      alert = <div className={"alert alert-"+this.state.messageType}>{this.state.message}</div>
    }
    if (this.state.user) {
      form = <Button onClick={this.handleContinue} className="btn-lg" bsStyle="success">Continue</Button>
    } else {
      form = (
        <div>
          <Button bsStyle="success" bsSize="large" onClick={this.handleLoginAnonymously}>Continue Anonymously</Button> or <Link to="signup">Sign Up</Link>
        </div>
      );
    }
    return (
      <div className="row loginPage">
        <div className="col-md-3"/>
        <div className="col-md-6">
          <div className="jumbotron">
          <h1>No Account?</h1>
          <p>Continue anonymously!</p>
          <p>Your play state will be saved, but only in the current browser session.</p>
          {alert}
          {form}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LoginAnonymouslyPage;