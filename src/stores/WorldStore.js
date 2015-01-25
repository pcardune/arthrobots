var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var WorldModel = require('../models/WorldModel');

var CHANGE_EVENT = 'change';
var NEW_WORLD_EVENT = 'new_world';
var DESTROY_WORLD_EVENT = 'destroy_world';

var _worlds = {};

var WorldStore = assign({}, EventEmitter.prototype, {

  getWorldsForTrack: function(trackId) {
    var worlds = [];
    for (var id in _worlds) {
      var world = _worlds[id]
      if (world.getTrack().id == trackId) {
        worlds.push(world);
      }
    }
    worlds.sort(function (a, b) { return a.getOrder() - b.getOrder(); });
    return worlds;
  },

  getWorld: function(worldId) {
    return _worlds[worldId];
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  emitNewWorld: function(world) {
    this.emit(NEW_WORLD_EVENT, world);
  },

  addNewWorldListener: function(callback) {
    this.on(NEW_WORLD_EVENT, callback);
  },

  removeNewWorldListener: function(callback) {
    this.removeListener(NEW_WORLD_EVENT, callback);
  },

  emitDestroyWorld: function(world) {
    this.emit(DESTROY_WORLD_EVENT, world);
  },

  addDestroyWorldListener: function(callback) {
    this.on(DESTROY_WORLD_EVENT, callback);
  },

  removeDestroyWorldListener: function(callback) {
    this.removeListener(DESTROY_WORLD_EVENT, callback);
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var action = payload.action;
    var text;

    switch(action.type) {
      case Constants.ActionTypes.RECEIVE_CREATED_WORLD:
        _worlds[action.world.id] = action.world;
        WorldStore.emitChange();
        WorldStore.emitNewWorld(action.world);
        break;
      case Constants.ActionTypes.RECEIVE_WORLDS:
        action.worlds.forEach(function(world) {
          _worlds[world.id] = world;
        });
        WorldStore.emitChange();
        break;
      case Constants.ActionTypes.WORLD_DESTROY:
        delete _worlds[action.world.id];
        WorldStore.emitChange();
        WorldStore.emitDestroyWorld();
        break;
    }

    return true; // No errors. Needed by promise in Dispatcher.
  })

});

module.exports = WorldStore;