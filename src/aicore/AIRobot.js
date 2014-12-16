var Class = require('../core/Class');

var AIRobot = Class.extend({
  init: function() {
    this.x = 1
    this.y = 1
    this.angle = 0
  },

  move: function() {
  	this.x += Math.cos(this.angle);
  	this.y += Math.sin(this.angle);
  },

  run: function() {
    // throw new Exception("You must implement the run() method.");
  }
});

module.exports = AIRobot;