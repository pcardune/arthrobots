var Constants = require('../constants/Constants');
var TrackModel = require('../models/TrackModel');
var WorldModel = require('../models/WorldModel');
var ProgramModel = require('../models/ProgramModel');

module.exports = {
  loadPrograms: function() {
    this.dispatch(Constants.ActionTypes.LOAD_PROGRAMS);
    var query = new Parse.Query(ProgramModel);
    query.equalTo("owner", Parse.User.current());
    query.include('world');
    query.find({
      success: function(programs) {
        this.dispatch(Constants.ActionTypes.LOAD_PROGRAMS_SUCCESS, {programs:programs});
      }.bind(this),
      error: function(error) {
        this.dispatch(Constants.ActionTypes.LOAD_PROGRAMS_FAIL, {error: error});
      }.bind(this)
    });
  },

  saveProgram: function(data, program, callback) {
    this.dispatch(Constants.ActionTypes.SAVE_PROGRAM);
    program.save(data, {
      success: function(program) {
        this.dispatch(Constants.ActionTypes.SAVE_PROGRAM_SUCCESS, {programs: [program]});
        callback();
      }.bind(this),
      error: function(program, error) {
        this.dispatch(Constants.ActionTypes.SAVE_PROGRAM_FAIL);
        console.error("There was an error while saving the program: "+error.code+" "+error.message);
      }.bind(this)
    });
  },

  loadTracks: function() {
    this.dispatch(Constants.ActionTypes.LOAD_TRACKS);
    var query = new Parse.Query(TrackModel);
    query.ascending("createdAt");
    query.find({
      success: function(tracks) {
        this.dispatch(Constants.ActionTypes.LOAD_TRACKS_SUCCESS, {tracks: tracks});
      }.bind(this),
      error: function(error) {
        this.dispatch(Constants.ActionTypes.LOAD_TRACKS_FAIL, {error: error});
      }.bind(this)
    });
  },

  loadTracksAndWorlds: function() {
    this.dispatch(Constants.ActionTypes.LOAD_TRACKS_AND_WORLDS);
    var query = new Parse.Query(TrackModel);
    query.ascending("createdAt");
    query.find({
      success: function(tracks) {
        var worldQuery = new Parse.Query(WorldModel);
        worldQuery.containedIn("track", tracks);
        worldQuery.include('owner');
        worldQuery.find({
          success: function(worlds) {
            var owners = worlds.map(function(world){
              var owner = world.get('owner');
              // defensively unset nested owner so call sites are forced to use UserStore.
              var ownerPointer = new Parse.User();
              ownerPointer.id = owner.id;
              world.set('owner', ownerPointer);
              return owner;
            });
            this.dispatch(Constants.ActionTypes.LOAD_TRACKS_AND_WORLDS_SUCCESS, {tracks: tracks, worlds:worlds});
            this.dispatch(Constants.ActionTypes.LOAD_USERS_SUCCESS, {users: owners});
          }.bind(this),
          error: function(error) {
            console.error('Failed to get worlds, with error code: ' + error.message);
            this.dispatch(Constants.ActionTypes.LOAD_TRACKS_AND_WORLDS_FAIL, {error: error});
          }.bind(this)
        })
      }.bind(this),
      error: function(error) {
        console.error('Failed to get tracks, with error code: ' + error.message);
        this.dispatch(Constants.ActionTypes.LOAD_TRACKS_FAIL, {error: error});
      }.bind(this)
    });
  },

  loadWorld: function(id) {
    this.dispatch(Constants.ActionTypes.LOAD_WORLDS);
    var query = new Parse.Query(WorldModel);
    query.get(id, {
      success: function(world) {
        this.dispatch(Constants.ActionTypes.LOAD_WORLDS_SUCCESS, {worlds:[world]})
      }.bind(this),
      error: function(object, error) {
        console.error("failed to load: "+error.code+" "+error.message);
        this.dispatch(Constants.ActionTypes.LOAD_WORLDS_FAIL, {error:error});
      }.bind(this)
    });
  },

  addWorld: function(name, trackId) {
    this.dispatch(Constants.ActionTypes.ADD_WORLD);
    var world = new WorldModel();
    world.set('owner', Parse.User.current());
    world.set('name', name);
    var track = new TrackModel();
    track.id = trackId
    world.set('track', track);
    world.save(null, {
      success: function(world) {
        this.dispatch(Constants.ActionTypes.ADD_WORLD_SUCCESS, {world:world});
      }.bind(this),
      error: function(world, error) {
        console.error('Failed to create new world, with error code: ' + error.message);
        this.dispatch(Constants.ActionTypes.ADD_WORLD_FAIL, {error:error});
      }.bind(this)
    });
  },

  destroyWorld: function(world) {
    this.dispatch(Constants.ActionTypes.DESTROY_WORLD);
    world.destroy({
      success: function(world) {
        this.dispatch(Constants.ActionTypes.DESTROY_WORLD_SUCCESS, {world:world});
      }.bind(this),
      error: function(world, error) {
        this.dispatch(Constants.ActionTypes.DESTROY_WORLD_FAIL, {error: error});
        alert("There was an error while deleting the world: "+error.code+" "+error.message);
      }.bind(this)
    });
  },

  saveWorld: function(data, world, callback) {
    this.dispatch(Constants.ActionTypes.SAVE_WORLD);
    world.needsSave = false;
    world.save(data, {
      success: function(world) {
        this.dispatch(Constants.ActionTypes.SAVE_WORLD_SUCCESS, {worlds:[world]});
        callback && callback();
      }.bind(this),
      error: function(world, error) {
        this.dispatch(Constants.ActionTypes.SAVE_WORLD_FAIL, {error:error});
      }.bind(this)
    });
  },

  saveWorldLocal: function(data, world) {
    for (var key in data) {
      if (data[key] !== world.get(key)) {
        world.set(key, data[key]);
      }
    }
    world.needsSave = true;
    this.dispatch(Constants.ActionTypes.SAVE_WORLD_LOCAL, {world:world});
  }
};