var Constants = require('../constants/Constants');
var Fluxxor = require('fluxxor');

var CHANGE_EVENT = 'change';

var NEW_WORLD_EVENT = 'new_world';
var DESTROY_WORLD_EVENT = 'destroy_world';

var WorldStore = Fluxxor.createStore({
  initialize: function() {
    this.loading = false;
    this.error = null;
    this.worlds = {};
    this.bindActions(
      Constants.ActionTypes.LOAD_WORLDS, this.onLoadWorlds,
      Constants.ActionTypes.LOAD_WORLDS_SUCCESS, this.onLoadWorldsSuccess,
      Constants.ActionTypes.LOAD_WORLDS_FAIL, this.onLoadWorldsFail,

      Constants.ActionTypes.LOAD_TRACKS_AND_WORLDS, this.onLoadWorlds,
      Constants.ActionTypes.LOAD_TRACKS_AND_WORLDS_SUCCESS, this.onLoadWorldsSuccess,
      Constants.ActionTypes.LOAD_TRACKS_AND_WORLDS_FAIL, this.onLoadWorldsFail,

      Constants.ActionTypes.ADD_WORLD, this.onAddWorld,
      Constants.ActionTypes.ADD_WORLD_SUCCESS, this.onAddWorldSucces,
      Constants.ActionTypes.ADD_WORLD_FAIL, this.onAddWorldFail,

      Constants.ActionTypes.DESTROY_WORLD, this.onDestroyWorld,
      Constants.ActionTypes.DESTROY_WORLD_SUCCESS, this.onDestroyWorldSuccess,
      Constants.ActionTypes.DESTROY_WORLD_FAIL, this.onDestroyWorldFail,

      Constants.ActionTypes.SAVE_WORLD, this.onLoadWorlds,
      Constants.ActionTypes.SAVE_WORLD_SUCCESS, this.onLoadWorldsSuccess,
      Constants.ActionTypes.SAVE_WORLD_FAIL, this.onLoadWorldsFail,
      Constants.ActionTypes.SAVE_WORLD_LOCAL, this.onSaveWorldLocal
    );
  },

  onSaveWorldLocal: function(payload) {
    this.worlds[payload.world.id] = payload.world;
    this.emit(CHANGE_EVENT);
  },

  onLoadWorlds: function() {
    this.loading = true;
    this.emit(CHANGE_EVENT);
  },

  onLoadWorldsSuccess: function(payload) {
    this.loading = false;
    this.error = null;
    payload.worlds.forEach(function(world){
      this.worlds[world.id] = world;
    }.bind(this));
    this.emit(CHANGE_EVENT);
  },

  onLoadWorldsFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit(CHANGE_EVENT);
  },

  onAddWorld: function() {
    this.loading = true;
    this.emit(CHANGE_EVENT);
  },

  onAddWorldSucces: function(payload) {
    this.loading = false;
    this.error = null;
    this.worlds[payload.world.id] = payload.world;
    this.emit(CHANGE_EVENT);
    this.emit("create_success", payload.world);
  },

  onAddWorldFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit(CHANGE_EVENT);
  },

  onDestroyWorld: function() {
    this.loading = true;
    this.emit(CHANGE_EVENT);
  },

  onDestroyWorldSuccess: function(payload) {
    this.loading = false;
    this.error = null;
    delete this.worlds[payload.world.id];
    this.emit("destroy_success", payload.world);
    this.emit(CHANGE_EVENT);
  },

  onDestroyWorldFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit(CHANGE_EVENT);
  },

  isLoading: function() { return this.loading; },

  getError: function() { return this.error; },

  getWorldsForTrack: function(trackId) {
    var worlds = [];
    for (var id in this.worlds) {
      var world = this.worlds[id]
      if (world.getTrack().id == trackId) {
        worlds.push(world);
      }
    }
    worlds.sort(function (a, b) { return a.getOrder() - b.getOrder(); });
    return worlds;
  },

  getWorld: function(worldId) {
    return this.worlds[worldId];
  }
});

module.exports = WorldStore;