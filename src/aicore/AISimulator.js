var Class = require('../core/Class');
var AIWorld = require('./AIWorld');
var AIRobot = require('./AIRobot');

var AISimulator = Class.extend({
  init: function(world, renderer) {
    this.world = world
    this.renderer = renderer;
    this.frames = 0;
    this.running = false;
  },

  _innerRun: function(timestamp) {
    if (!this.startTime) {
      this.startTime = timestamp;
      this.frames += 1;
    }
    var robots = this.world.getRobots();
    for (var i = 0; i < robots.length; i++) {
      try {
        robots[i].run();
      } catch (e) {
        console.warn(e);
        this.pause();
      }
    }
    this.renderer.render();
    if (this.running) {
      window.requestAnimationFrame(this._innerRun.bind(this))
    }
  },

  run: function() {
    this.running = true;
    window.requestAnimationFrame(this._innerRun.bind(this));
  },

  pause: function() {
    this.running = false;
  }
});

module.exports = AISimulator;