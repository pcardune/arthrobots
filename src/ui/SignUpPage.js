/** @jsx React.DOM */

var Button = require('react-bootstrap').Button;
var Link = require('react-router').Link;
var Navigation = require('react-router').Navigation;
var Parse = require('parse-browserify');
var React = require('react');

var SignUpPage = React.createClass({
  mixins: [Navigation],

  getInitialState: function() {
    return {
      message: "",
      messageType: "",
      user: Parse.User.current()
    }
  },

  handleContinue: function() {
    window.location = "/";
  },

  handleSignUp: function() {
    if (this.refs.password.getDOMNode().value != this.refs.passwordConfirm.getDOMNode().value) {
      this.setState({
        message:"The passwords do not match",
        messageType:"warning"
      });
    }

    this.setState({
      message:"Signing you up",
      messageType:"info"
    });

    var user = new Parse.User();
    user.set("username", this.refs.username.getDOMNode().value);
    user.set("password", this.refs.password.getDOMNode().value);
    user.set("email", this.refs.email.getDOMNode().value);
    user.setACL(new Parse.ACL(user));

    user.signUp(null, {
      success: function(user) {
        // Hooray! Let them use the app now.
        this.setState({
          message:"Great Success!",
          messageType:"success",
          user: Parse.User.current()
        });
      }.bind(this),
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

    var form = null;
    if (this.state.user) {
      form = <Button onClick={this.handleContinue} className="btn-lg" bsStyle="success">Continue</Button>
    } else {
      form = (
        <form>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" ref="username" className="form-control" placeholder="Enter username" />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="text" ref="email" className="form-control" placeholder="Enter email" />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" ref="password" className="form-control" placeholder="Password" />
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <input type="password" ref="passwordConfirm" className="form-control" placeholder="Confirm password" />
          </div>
          <Button onClick={this.handleSignUp} bsStyle="primary">Sign Up</Button> or <Link to="login">Log In</Link>
        </form>
      );
    }
    return (
      <div className="row loginPage">
        <div className="col-md-3"/>
        <div className="col-md-6">
          <div className="jumbotron">
            <h1>{this.state.user ? "W00t!" : "Sign Up!"}</h1>
            {alert}
            {form}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SignUpPage;