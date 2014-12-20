var Class = require('../core/Class');

var AIRobot = Class.extend({
  init: function(config) {
    var x = config.x;
    var y = config.y;
    var angle = config.angle;
    var world = config.world;
    var sprite = config.sprite;
    var game = config.game;

    sprite.body.collideWorldBounds = true;
    sprite.body.maxVelocity.setTo(400, 400)


    var distanceToWall = function(w) {
      var x1 = w.x1, y1 = w.y1, x2 = w.x2, y2 = w.y2;
      var x0 = x+Math.cos(angle);
      var y0 = y+Math.sin(angle);
      var distance = Math.abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1)/Math.sqrt(Math.pow(y2-y1,2)+Math.pow(x2-x1,2));
      return distance;
    };

    // define functions here so that extensions don't have access to above variables.
    this.getX = function() {
      return sprite.x;
    };

    this.getY = function() {
      return sprite.y;
    };

    this.getAngle = function() {
      return sprite.angle;
    };

    this.move = function() {
      s = sprite;
      game.physics.arcade.velocityFromRotation(sprite.rotation, 100, sprite.body.velocity);
    };

    this.turn = function(byAngle) {
      sprite.angle += byAngle;
    }

    this.run = function() {
      // needs to be implemented.
    };
  },
});

module.exports = AIRobot;