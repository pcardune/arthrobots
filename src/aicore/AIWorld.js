var Class = require('../core/Class');

var AIWorld = Class.extend({
  init: function() {
    this._robots = [];
    this._walls = [];
  },

  addRobot: function(robot) {
    this._robots.push(robot);
  },

  getRobots: function() {
    return this._robots;
  },

  addWall: function(wall) {
    this._walls.push(wall);
  },

  getWalls: function() {
    return this._walls;
  },

  replaceRobot: function(oldRobot, newRobot) {
    for (var i = 0; i < this._robots.length; i++) {
      if (oldRobot === this._robots[i]) {
        this._robots[i] = newRobot;
        return true;
      }
    }
    return false;
  }
});

AIWorld.Wall = Class.extend({
  init: function(config) {
    this.x1 = config.x1;
    this.y1 = config.y1;
    this.x2 = config.x2;
    this.y2 = config.y2;
  }
})

module.exports = AIWorld;