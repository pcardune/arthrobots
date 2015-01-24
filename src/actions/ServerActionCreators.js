var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants')

module.exports = {
  receiveCreatedWorld: function(world) {
    AppDispatcher.handleServerAction({
      type: Constants.ActionTypes.RECEIVE_CREATED_WORLD,
      world: world
    });
  },

  receiveWorlds: function(worlds) {
    AppDispatcher.handleServerAction({
      type: Constants.ActionTypes.RECEIVE_WORLDS,
      worlds: worlds
    });
  },

  destroyWorld: function(world) {
    AppDispatcher.handleServerAction({
      type:Constants.ActionTypes.WORLD_DESTROY,
      world:world
    });
  }
};