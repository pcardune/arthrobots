
var UserUtils = {
	createAnonymousUser: function(callback) {
		var user = new Parse.User();
    var username = ''+Math.floor(Math.random()*1000000000);
    var password = ''+Math.floor(Math.random()*1000000000);
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    user.set("username", username);
    user.set("password", password);

    user.signUp(null, callback);
	},

	loginAnonymousUser: function(callback) {
    if (localStorage.getItem('username') && localStorage.getItem('password')) {
			Parse.User.logIn(
	      localStorage.getItem('username'),
	      localStorage.getItem('password'),
	      callback
	    );
		} else {
			UserUtils.createAnonymousUser(callback);
		}
	}
};

module.exports = UserUtils;