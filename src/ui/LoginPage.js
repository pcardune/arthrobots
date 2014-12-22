/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Link = require('react-router').Link;
var React = require('react');

var LoginPage = React.createClass({

  getInitialState: function() {
    return {
      message: "",
      messageType: ""
    }
  },

  handleFBLogin: function() {
    this.setState({
      message:"Logging you in...",
      messageType:"info"
    });
    Parse.FacebookUtils.logIn(null, {
      success: function(user) {
        Parse.Analytics.track('FBLoginSuccess', {});
        FB.api('/me', function(response) {
          user.set('fbProfile', response);
          user.save(null, {success:function() {
            window.location = "/";
          }});
        });
      },
      error: function(user, error) {
        Parse.Analytics.track('FBLoginFail', {error:error});
      }
    });
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

  componentDidMount: function() {
    this.refs.username.getDOMNode().focus();
  },

  handleKeyPress: function(event) {
    // press enter
    if (event.which == 13) {
      this.handleLogin(event)
    }
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
            <h1>Log In!</h1>
            {alert}
            <form>
              <div className="form-group">
                <Button bsStyle="primary" onClick={this.handleFBLogin}>Login with Facebook</Button>
              </div>
              <div className="form-group">
                <label>Username:</label>
                <input ref="username" type="text" className="form-control" placeholder="Enter username" />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input ref="password" type="password" className="form-control" placeholder="Password" onKeyPress={this.handleKeyPress} />
              </div>
              <Button onClick={this.handleLogin}>
                Log In
              </Button> or <Link to="signup">Sign Up</Link> or <Link to="login-anonymously">Continue Anonymously</Link>
            </form>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LoginPage;