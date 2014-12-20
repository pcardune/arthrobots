var Class = require('../core/Class');
var AIWorld = require('./AIWorld');
var AIRobot = require('./AIRobot');

var AISimulator = Class.extend({
  init: function(world, game) {
    this.world = world
    this.game = game;
  },

  tick: function() {
    var robots = this.world.getRobots();
    for (var i = 0; i < robots.length; i++) {
      try {
        robots[i].run();
      } catch (e) {
        console.warn(e);
      }
    }
  }
});

module.exports = AISimulator;