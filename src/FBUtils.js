var gravatar = require('gravatar');

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
  }
};

module.exports = FBUtils;