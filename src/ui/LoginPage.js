/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Parse = require('parse').Parse;
var React = require('react');


var LoginPage = React.createClass({

  getInitialState: function() {
    return {
      message: "",
      messageType: ""
    }
  },

  handleLogin: function() {
    this.setState({
      message:"Logging you in...",
      messageType:"info"
    });
    Parse.User.logIn(
      this.refs.username.getDOMNode().value,
      this.refs.password.getDOMNode().value,
      {
        success: function(user) {
          this.setState({
            message:"Great success!",
            messageType:"success"
          });
          window.location = "/";
        }.bind(this),
        error: function(user, error) {
          this.setState({
            message:"There was an error while logging you in: "+error.code+" "+error.message,
            messageType:"danger"
          });
        }.bind(this)
      }
    );
  },

  render: function() {
    var alert = null;
    if (this.state.message) {
      alert = <div className={"alert alert-"+this.state.messageType}>{this.state.message}</div>
    }
    return (
      <div className="row loginPage">
        <div className="col-md-3"/>
        <div className="col-md-6">
          <div className="jumbotron">
            <h1>Login!</h1>
            {alert}
            <form>
              <div className="form-group">
                <label>Username:</label>
                <input ref="username" type="text" className="form-control" placeholder="Enter username" />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input ref="password" type="password" className="form-control" placeholder="Password" />
              </div>
              <Button onClick={this.handleLogin}>Login</Button>
            </form>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LoginPage;