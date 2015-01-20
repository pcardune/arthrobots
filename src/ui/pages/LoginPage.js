/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Link = require('react-router').Link;
var React = require('react');
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;
var FBUtils = require('../../FBUtils');

var LoginPage = React.createClass({
  mixins: [Navigation, State],

  getInitialState: function() {
    return {
      message: "",
      messageType: ""
    }
  },

  goToNextUrl: function() {
    window.location = this.getQuery().next || "/";
  },

  handleFBLogin: function() {
    this.setState({
      message:"Logging you in...",
      messageType:"info"
    });
    FBUtils.logIn({
      success: function() {
        this.goToNextUrl();
      }.bind(this)
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
          this.goToNextUrl();
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
      <div className="row LoginPage">
        <div className="col-md-3"/>
        <div className="col-md-6">
          <div className="jumbotron">
            {alert}
            <form>
              <div className="form-group text-center">
                <Button bsSize="large" bsStyle="primary" onClick={this.handleFBLogin}>
                  <span className="fa fa-facebook-square"/> Login with Facebook
                </Button>
              </div>
              <div className="form-group">
                <div className="text-center" style={{padding:"20px"}}>
                  or with your username:
                </div>
                <label>Username:</label>
                <input ref="username" type="text" className="form-control" placeholder="Enter username" />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input ref="password" type="password" className="form-control" placeholder="Password" onKeyPress={this.handleKeyPress} />
              </div>
              <Button onClick={this.handleLogin}>
                Log In
              </Button> or <Link to="signup">Sign Up</Link>
            </form>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LoginPage;