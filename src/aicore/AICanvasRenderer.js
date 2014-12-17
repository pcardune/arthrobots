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
    this.context.translate(robot.getX(), robot.getY());
    this.context.rotate(robot.getAngle());

    this.context.beginPath();
    this.context.moveTo(5, 0);
    this.context.lineTo(-5, 5);
    this.context.lineTo(-5, -5);
    this.context.closePath();
    this.context.stroke();
    this.context.fill();

    this.context.restore();
  },

  renderWall: function(wall) {
    this.context.save();

    this.context.strokeStyle = 'black';
    this.context.lineWidth = 2;

    this.context.beginPath();
    this.context.moveTo(wall.x1, wall.y1);
    this.context.lineTo(wall.x2, wall.y2);
    this.context.stroke();
    this.context.restore();
  },

  renderMany: function(items, renderer) {
    renderer = renderer.bind(this);
    for (var i = 0; i < items.length; i++) {
      renderer(items[i]);
    }
  },

  render: function() {
    this.context.save();
    this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    //reorient to bottom left being 0 0;
    this.context.transform(1,0,0,-1,0,this.canvas.height);

    this.renderMany(this.world.getRobots(), this.renderRobot);
    this.renderMany(this.world.getWalls(), this.renderWall);
    this.context.restore();
  }
});

module.exports = AICanvasRenderer;