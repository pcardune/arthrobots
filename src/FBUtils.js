var gravatar = require('gravatar');
import Parse from 'parse'
var FBUtils = {
  getProfilePic: function(user) {
    var fbProfile = user.get('fbProfile');
    if (fbProfile && fbProfile.id) {
      return 'http://graph.facebook.com/'+fbProfile.id+'/picture?type=square&width=170&height=170'
    } else {
      return gravatar.url(user.get('email'), {s:170});
    }
  },

  getUserName: function(user) {
    if (user.get('fbProfile')) {
      return user.get('fbProfile').name;
    } else if (user.get('email')) {
      return user.get('username');
    }
    return 'Anonymous User';
  },

  logIn: function(callback) {
    Parse.FacebookUtils.logIn(null, {
      success: function(user) {
        Parse.Analytics.track('FBLoginSuccess', {});
        FB.api('/me', function(response) {
          user.set('fbProfile', response);
          user.save(null, callback);
        });
      },
      error: function(user, error) {
        Parse.Analytics.track('FBLoginFail', {error:error});
        if (callback.error) {
          callback.error(error);
        }
      }
    });
  },

  linkAccount: function(callback) {
    Parse.FacebookUtils.link(Parse.User.current(), null, {
      success: function(user) {
        FB.api('/me', function(response) {
          user.set('fbProfile', response);
          user.save(null, callback);
        }.bind(this));
      }.bind(this),
      error: function(user, error) {
        console.warn("User cancelled the Facebook login or did not fully authorize:", error);
        if (callback.error) {
          callback.error(error);
        }
      }
    });
  }
};

module.exports = FBUtils;