
var Button = require('react-bootstrap').Button;
var Link = require('react-router').Link;
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;
var React = require('react');
var ReactDOM = require('react-dom');
var FBUtils = require('../../FBUtils');

require('./SignUpPage.css');
var SignUpPage = React.createClass({
  mixins: [Navigation, State],

  getInitialState: function() {
    return {
      message: "",
      messageType: "",
      user: Parse.User.current(),
      showFacebook: true
    }
  },

  handleContinue: function() {
    window.location = this.props.location.query.next || "/";
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

    var wasAnonymous = false;
    if (this.state.user && !this.state.user.get('email')) {
      wasAnonymous = true;
    }
    var user = this.state.user || new Parse.User();
    user.set("username", ReactDOM.findDOMNode(this.refs.username).value);
    user.set("password", ReactDOM.findDOMNode(this.refs.password).value);
    user.set("email", ReactDOM.findDOMNode(this.refs.email).value);

    user.signUp(null, {
      success: function(user) {
        // Hooray! Let them use the app now.
        this.setState({
          message:"Great Success!",
          messageType:"success",
          user: Parse.User.current()
        });
        if (wasAnonymous) {
          localStorage.removeItem('username');
          localStorage.removeItem('password');
        }
        this.handleContinue();
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

  handleFBSignup: function() {
    if (Parse.User.current()) {
      FBUtils.linkAccount({
        success: function() {
          console.log("successfully linked account");
          this.setState(this.getInitialState())
          this.handleContinue();
        }.bind(this),
        error: function() {
          console.warn("failed to link account");
          FBUtils.logIn({
            success: function() {
              this.setState(this.getInitialState())
              this.handleContinue();
            }.bind(this)
          });
        }.bind(this)
      });
    } else {
      FBUtils.logIn({
        success: function() {
          this.setState(this.getInitialState())
          this.handleContinue();
        }.bind(this)
      });
    }
  },

  showEmailSignup: function() {
    this.setState({showFacebook:false});
  },

  render: function() {
    var alert = null;
    if (this.state.message) {
      alert = <div className={"alert alert-"+this.state.messageType}>{this.state.message}</div>
    }

    var form = null;
    if (this.state.user && this.state.user.get('email')) {
      form = <Button onClick={this.handleContinue} className="btn-lg" bsStyle="success">Continue</Button>
    } else if (this.state.showFacebook) {
      form = (
        <div className="text-center">
          <Button bsStyle="primary" bsSize="large" onClick={this.handleFBSignup}>
            <span className="fa fa-facebook-square"/> Sign Up with Facebook
          </Button>
          <div style={{padding:"20px"}}>
            or <a href="#" onClick={this.showEmailSignup}>sign up with a username</a>
          </div>
        </div>
      );
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
          <Button onClick={this.handleSignUp} bsStyle="primary">Sign Up</Button> or <Link to="/login">Log In</Link>
        </form>
      );
    }
    return (
      <div className="row SignUpPage">
        <div className="col-md-3"/>
        <div className="col-md-6">
          <div className="jumbotron">
            {alert}
            {form}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SignUpPage;