
var Button = require('react-bootstrap').Button;
var Link = require('react-router').Link;
var Navigation = require('react-router').Navigation;
var React = require('react');
var ReactDOM = require('react-dom');

var UpgradeAccountPage = React.createClass({
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
    if (ReactDOM.findDOMNode(this.refs.password).value !=
        ReactDOM.findDOMNode(this.refs.passwordConfirm).value) {
      this.setState({
        message:"The passwords do not match",
        messageType:"warning"
      });
    }

    this.setState({
      message:"Signing you up",
      messageType:"info"
    });

    var user = this.state.user;
    user.set("username", ReactDOM.findDOMNode(this.refs.username).value);
    user.set("password", ReactDOM.findDOMNode(this.refs.password).value);
    user.set("email", ReactDOM.findDOMNode(this.refs.email).value);
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
    if (this.state.user.get('email')) {
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
          <Button onClick={this.handleSignUp} bsStyle="primary">Sign Up</Button>
        </form>
      );
    }
    return (
      <div className="row loginPage">
        <div className="col-md-3"/>
        <div className="col-md-6">
          <div className="jumbotron">
            <h1>{this.state.user.get('email') ? "W00t!" : "Sign Up!"}</h1>
            {alert}
            {form}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = UpgradeAccountPage;