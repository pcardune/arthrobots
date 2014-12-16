var Class = require('../core/Class');

var AIWorld = Class.extend({
  init: function() {
    this._robots = []
  },

  addRobot: function(robot) {
    this._robots.push(robot)
  },

  getRobots: function() {
    return this._robots;
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

module.exports = AIWorld;