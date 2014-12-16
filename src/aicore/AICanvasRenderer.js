var Class = require('../core/Class');

var AICanvasRenderer = Class.extend({
  init: function(canvas, world) {
    this.canvas = canvas;
    this.world = world;

    this.context = this.canvas.getContext('2d');
    this.context.font = "20px Arial";
  },

  renderRobot: function(robot) {
    this.context.save();
    this.context.fillStyle = 'white';
    this.context.strokeStyle = 'red';
    this.context.lineWidth = 5;
    this.context.translate(robot.x, robot.y);
    this.context.rotate(robot.angle);

    this.context.beginPath();
    this.context.moveTo(5, 0);
    this.context.lineTo(-5, 5);
    this.context.lineTo(-5, -5);
    this.context.closePath();
    this.context.stroke();
    this.context.fill();

    this.context.restore();
  },

  render: function() {
    this.context.save();
    this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    //reorient to bottom left being 0 0;
    this.context.transform(1,0,0,-1,0,this.canvas.height);

    var robots = this.world.getRobots();
    for (var i = 0; i < robots.length; i++) {
      this.renderRobot(robots[i]);
    }
    this.context.restore();
  }
});

module.exports = AICanvasRenderer;