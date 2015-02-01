var Constants = require('../constants/Constants');
var Fluxxor = require('fluxxor');

var CHANGE_EVENT = 'change';

var UserStore = Fluxxor.createStore({
  initialize: function() {
    this.loading = false;
    this.error = null;
    this.users = {};
    this.bindActions(
      Constants.ActionTypes.LOAD_USERS, this.onLoadUsers,
      Constants.ActionTypes.LOAD_USERS_SUCCESS, this.onLoadUsersSuccess,
      Constants.ActionTypes.LOAD_USERS_FAIL, this.onLoadUsersFail
    );
  },

  onLoadUsers: function() {
    this.loading = true;
    this.emit(CHANGE_EVENT);
  },

  onLoadUsersSuccess: function(payload) {
    this.loading = false;
    this.error = null;
    payload.users.forEach(function(user){
      this.users[user.id] = user;
    }.bind(this));
    this.emit(CHANGE_EVENT);
  },

  onLoadUsersFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit(CHANGE_EVENT);
  },

  isLoading: function() { return this.loading; },

  getError: function() { return this.error; },

  getUser: function(id) {
    return this.users[id];
  }
});

module.exports = UserStore;