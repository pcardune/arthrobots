var ProgramModel = require('./ProgramModel');
var TrackModel = require('./TrackModel');
var World = require('../core/World');
var WorldParser = require('../core/WorldParser');
var ServerActionCreators = require('../actions/ServerActionCreators');
var assign = require('object-assign');

var WorldModel = Parse.Object.extend("WorldModel", {
  loadCurrentUserPrograms: function(success) {
    var query = new Parse.Query(ProgramModel);
    query.equalTo("world", this);
    query.equalTo("owner", Parse.User.current());
    query.find({
      success: success,
      error: function() {
        alert("there was an error loading programs:"+error.code+" "+error.message);
      }
    });
  },

  getTrack: function() {
    return this.get('track');
  },

  getOrder: function() {
    return this.get('order');
  },

  getSteps: function() {
    var worldStepDefinitions = [this.get('definition')];
    return worldStepDefinitions.concat(this.get('steps') || []);
  },

  setSteps: function(steps) {
    this.set('definition', steps[0]);
    this.set('steps', steps.slice(1));
  },

  getNewWorld: function() {
    var world = new World();
    var parser = new WorldParser(this.get('definition').split('\n'), world);
    parser.parse();
    return world;
  },

  getNewWorldAtStep: function(index) {
    var world = new World();
    var parser = new WorldParser(this.get('steps')[index].split('\n'), world);
    parser.parse();
    return world;
  },

  getTitle: function() {
    if (this.get('order')) {
      return 'Level '+this.get('order')+': '+this.get('name');
    }
    return this.get('name');
  }
});

assign(WorldModel, {
  createNewWorld: function(worldModel) {
    worldModel.save(null, {
      success: function(world) {
        ServerActionCreators.receiveCreatedWorld(world);
      },
      error: function(world, error) {
        alert('Failed to create new world, with error code: ' + error.message);
      }
    });
  },

  saveWorld: function(data, world) {
    world.save(data, {
      success: function(world) {
        ServerActionCreators.receiveWorlds([world]);
      },
      error: function(world, error) {
        alert("There was an error while saving the world: "+error.code+" "+error.message);
      }
    });
  },

  destroyWorld: function(world) {
    world.destroy({
      success: function(world) {
        ServerActionCreators.destroyWorld(world);
      },
      error: function(world, error) {
        alert("There was an error while deleting the world: "+error.code+" "+error.message);
      }
    });
  },

  fetchWorld: function(id) {
    var query = new Parse.Query(WorldModel);
    query.get(id, {
      success: function(worldModel) {
        ServerActionCreators.receiveWorlds([worldModel]);
      },
      error: function(object, error) {
        alert("failed to load: "+error.code+" "+error.message);
      }
    });
  },

  fetchWorldsForTrack: function(trackId) {
    var query = new Parse.Query(WorldModel);
    var track = new TrackModel();
    track.id = trackId;
    query.equalTo("track", track);
    query.include("owner");
    query.include("track");
    query.find({
      success: function(worldModels) {
        ServerActionCreators.receiveWorlds(worldModels);
      },
      error: function(error) {
        alert('Failed to get worlds, with error code: ' + error.message);
      }
    });
  }
});

module.exports = WorldModel;