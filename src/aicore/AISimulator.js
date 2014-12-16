var Class = require('../core/Class');
var AIWorld = require('./AIWorld');
var AIRobot = require('./AIRobot');

var AISimulator = Class.extend({
  init: function(world, renderer) {
    this.world = world
    this.renderer = renderer;
    this.frames = 0;
  },

  _innerRun: function(timestamp) {
    if (!this.startTime) {
      this.startTime = timestamp;
      this.frames += 1;
    }
    var robots = this.world.getRobots();
    for (var i = 0; i < robots.length; i++) {
      robots[i].run();
    }
    this.renderer.render();
    window.requestAnimationFrame(this._innerRun.bind(this))
  },

  run: function() {
    window.requestAnimationFrame(this._innerRun.bind(this));
  }
});

module.exports = AISimulator;