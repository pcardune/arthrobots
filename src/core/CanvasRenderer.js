var Class = require('./Class');

import Robot from './Robot'

var CanvasRenderer = Class.extend(
  /** @lends gvr.renderer.Renderer# */
  {
    /**
     * @class Renderer for a world.
     * @constructs
     * @param canvasEl The <canvas> dom element
     *         which is used as the rendering context.
     * @param world See {@link gvr.renderer.Renderer#world}
     */
    init: function(canvasEl, world){
      /**
       * The canvas dom element.
       */
      this.canvas = canvasEl;

      /**
       * The drawing context which is obtained
       * from {@link gvr.renderer.Renderer#canvas}
       */
      this.context = this.canvas.getContext('2d');
      this.context.font = "15px Arial";
      //compatibility for older firefoxes (I hope)
      var that = this;
      if (typeof this.context.measureText === "undefined" &&
        typeof this.context.mozMeasureText !== "undefined"){
        this.context.measureText = function(text){
          return {width: that.context.mozMeasureText(text)};
        };
      }
      if (typeof this.context.fillText === "undefined" &&
        typeof this.context.mozDrawText !== "undefined"){
        this.context.fillText = function(text, x, y){
          return that.context.mozDrawText(text);
        };
      }

      /**
       * The world object to render.
       * @type {gvr.world.World}
       */
      this.world = world;

      /**
       * The lower x coordinate bound for rendering the world.
       * @type {int}
       */
      this.startX = 1;

      /**
       * The lower y coordinate bound for rendering the world.
       * @type int
       */
      this.startY = 1;

      /**
       * The upper x coordinate bound for rendering the world.
       * @type int
       */
      this.endX = 12;

      /**
       * The upper y coordinate bound for rendering the world.
       * @type int
       */
      this.endY = 12;

      /**
       * The scale (in pixels) of each coordinate.
       * @type int
       */
      this.scale = 40;

      this.shouldFollowRobot = true;
    },

    /**
     * Given world coordiantes, returns corresponding coordinates
     * for the rendering context.
     * @param x the x coordinate in the world.
     * @param y the y coordinate in the world.
     */
    getCanvasCoords: function(x, y){
      return {x: x*this.scale,y: y*this.scale};
    },

    /**
     * Render the boundaries.
     * @private
     */
    renderBounderies: function(){
      this.context.fillStyle = this.startY === 1 ? 'red':'#aaffaa';
      var coords = this.getCanvasCoords(this.startX,this.startY);
      this.context.fillRect(coords.x,coords.y,this.canvas.width,2);

      this.context.fillStyle = this.startX === 1 ? 'red':'#aaffaa';
      coords = this.getCanvasCoords(this.startX,this.startY);
      this.context.fillRect(coords.x,coords.y,2,this.canvas.height);
    },

    /**
     * Render the street corners
     * @private
     */
    renderCorners: function(){
      this.context.fillStyle = '#000000';
      for (var x=2; x <= this.endX-this.startX+1; x++){
        for (var y=2; y <= this.endY-this.startY+1; y++){
          var coords = this.getCanvasCoords(x,y);
          this.context.fillRect(coords.x,coords.y,4,4);
        }
      }
    },

    /**
     * Render the robot
     * @private
     */
    renderRobot: function(){
      if (this.robot.x < this.startX || this.robot.y < this.startY) {
        return;
      }
      this.context.save();
      this.context.fillStyle = 'white';
      this.context.lineWidth = 5;
      var coords = this.getCanvasCoords(
        this.robot.x, this.robot.y);
      this.context.translate(
        coords.x+this.scale/2, coords.y+this.scale/2);
      this.context.rotate(this.robot.radians);
      var padding = this.scale*0.2;
      this.context.beginPath();
      this.context.moveTo(-this.scale/2+padding, -this.scale/2+padding);
      this.context.lineTo(this.scale/2-padding, -this.scale/2+padding);
      this.context.lineTo(0,this.scale/2-padding);
      this.context.closePath();
      this.context.stroke();
      this.context.fill();

      this.context.fillStyle = 'red';
      this.context.strokeStyle = 'red';
      this.context.lineWidth = 1;
      var padding = this.scale*0.2;
      var beepers = this.world.robot.beepers;
      if (beepers > 0){
        this.context.beginPath();
        this.context.arc(
          0, -3,
          this.scale/2-padding-4, 0, Math.PI*2, false);
        this.context.stroke();
        if (beepers < 2){
          this.context.beginPath();
          this.context.arc(
            0, -3,
            this.scale/2-padding-4-3, 0, Math.PI*2, false);
          this.context.fill();
        } else {
          this.context.save();
          this.context.font = "10px Arial";
          var width = this.context.measureText(""+beepers).width;
          this.context.translate(-width/2, -6);
          this.context.scale(1,-1);
          this.context.fillText(""+beepers, 0, 0);
          this.context.restore();
        }
      }
      this.context.restore();
    },

    /**
     * Render the coordinates along the sides of the canvas
     * @private
     */
    renderCoordinates: function(){
      this.context.fillStyle = 'black';
      var coords, width, height;
      for (var x=this.startX; x < this.endX; x++){
        coords = this.getCanvasCoords(x, this.startY-1);
        this.context.save();
        width = this.context.measureText(""+x).width;
        this.context.translate(
          coords.x+this.scale/2-width/2, coords.y+this.scale/2);
        this.context.scale(1,-1);
        this.context.fillText(""+x, 0, 0);
        this.context.restore();
      }

      this.context.save();
      width = this.context.measureText("Avenues").width;
      this.context.translate(this.canvas.width/2-width/2 + this.startX*this.scale, 2 + (this.startY-1)*this.scale);
      this.context.scale(1,-1);
      this.context.fillText("Avenues", 0, 0);
      this.context.restore();

      for (var y=this.startY; y < this.endY; y++){
        coords = this.getCanvasCoords(this.startX-1, y);
        this.context.save();
        width = this.context.measureText(""+y).width;
        this.context.translate(
          coords.x+this.scale/2-width/2+6, coords.y+this.scale/2-6);
        this.context.scale(1,-1);
        this.context.fillText(""+y, 0, 0);
        this.context.restore();
      }

      this.context.save();
      height = this.context.measureText("Streets").height;
      this.context.translate(14 + (this.startX-1)*this.scale, this.canvas.height/2 + (this.startY-1)*this.scale);
      this.context.scale(1,-1);
      this.context.rotate(3*Math.PI/2);
      this.context.fillText("Streets", 0, 0);
      this.context.restore();

    },

    /**
     * Render the walls in the world.
     * @private
     */
    renderWalls: function(){
      this.context.fillStyle = 'red';
      for (var x=this.startX; x < this.endX; x++){
        for (var y=this.startY; y < this.endY; y++){
          var coords = this.getCanvasCoords(x, y);
          if (this.world.getWall(x, y, Robot.NORTH)){
            this.context.fillRect(
              coords.x,coords.y+this.scale, this.scale, 2);
          }
          if (this.world.getWall(x, y, Robot.EAST)){
            this.context.fillRect(
              coords.x+this.scale,coords.y, 2, this.scale);
          }
        }
      }
    },

    /**
     * Render the beepers in the world
     * @private
     */
    renderBeepers: function(){
      this.context.fillStyle = 'blue';
      this.context.strokeStyle = 'blue';
      for (var x=this.startX; x < this.endX; x++){
        for (var y=this.startY; y < this.endY; y++){
          var coords = this.getCanvasCoords(x, y);
          var padding = this.scale*0.2;
          var beepers = this.world.getBeepers(x, y);
          if (beepers > 0){
            this.context.beginPath();
            this.context.arc(
              coords.x+this.scale/2, coords.y+this.scale/2,
              this.scale/2-padding, 0, Math.PI*2, false);
            this.context.stroke();
            if (beepers < 2){
              this.context.beginPath();
              this.context.arc(
                coords.x+this.scale/2, coords.y+this.scale/2,
                this.scale/2-padding-3, 0, Math.PI*2, false);
              this.context.fill();
            } else {
              this.context.save();
              var width = this.context.measureText(""+beepers).width;
              this.context.translate(coords.x+this.scale/2-width/2, coords.y+this.scale/2-6);
              this.context.scale(1,-1);
              this.context.fillText(""+beepers, 0, 0);
              this.context.restore();
            }
          }
        }
      }
    },

    /**
     * Adjusts {@link gvr.renderer.Renderer#startX}, {@link gvr.renderer.Renderer#startY},
     * {@link gvr.renderer.Renderer#endX}, and {@link gvr.renderer.Renderer#endY} such that
     * the robot is guaranteed to be within view of the rendering boundaires.
     */
    followRobot: function(){
      var maxX = this.endX-1;
      var maxY = this.endY-1;
      var jumpX = 0;
      var jumpY = 0;
      if (this.world.robot.x > maxX){
        jumpX = this.world.robot.x - maxX;
      } else if (this.world.robot.x < this.startX){
        jumpX =  this.world.robot.x - this.startX;
      }
      if (this.world.robot.y > maxY){
        jumpY = this.world.robot.y - maxY;
      } else if (this.world.robot.y < this.startY){
        jumpY = this.world.robot.y - this.startY;
      }
      this.startX += jumpX;
      this.endX += jumpX;
      this.startY += jumpY;
      this.endY += jumpY;
    },

    _renderFrame: function() {
      if (this.shouldFollowRobot) {
        this.followRobot();
      }
      this.context.save();
      this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
      //reorient to bottom left being 0 0;
      this.context.transform(1,0,0,-1,0,this.canvas.height);
      this.renderCorners();

      this.context.save();
      this.context.translate(-(this.startX-1)*this.scale,
                   -(this.startY-1)*this.scale);
      this.renderBounderies();
      this.renderWalls();
      this.renderBeepers();
      this.renderRobot();
      this.renderCoordinates();
      this.context.restore();

      this.context.restore();
    },

    _renderFrameWithTimeout: function(speed) {
      var start = null;
      var step = function(timestamp) {
        if (!start) {
          start = timestamp;
        }
        var radians = {
          NORTH:0,
          WEST:Math.PI/2,
          SOUTH:Math.PI,
          EAST:3*Math.PI/2
        }[this.world.robot.direction];
        var progress = timestamp - start;
        if (progress < speed) {
          this.robot.x = this.robotStart.x + progress*(this.world.robot.x - this.robotStart.x)/speed;
          this.robot.y = this.robotStart.y + progress*(this.world.robot.y - this.robotStart.y)/speed;
          while (radians - this.robotStart.radians < 0) {
            radians += Math.PI*2;
          }
          this.robot.radians = this.robotStart.radians + progress*(radians - this.robotStart.radians)/speed;
          this.robot.radians = this.robot.radians % (2*Math.PI);
        } else {
          this.robot.x = this.world.robot.x;
          this.robot.y = this.world.robot.y;
          this.robot.radians = radians;
        }
        this._renderFrame();
        if (progress < speed) {
          window.requestAnimationFrame(step);
        }
      }.bind(this);
      window.requestAnimationFrame(step);
    },

    render: function(speed){
      speed = speed || 200;
      if (this.robot == undefined) {
        this.robot = {
          x: this.world.robot.x,
          y: this.world.robot.y,
          radians:{
            NORTH:0,
            WEST:Math.PI/2,
            SOUTH:Math.PI,
            EAST:3*Math.PI/2
          }[this.world.robot.direction]
        };
      }
      this.robotStart = {
        x: this.robot.x,
        y: this.robot.y,
        radians: this.robot.radians
      };
      this._renderFrameWithTimeout(speed);
    }

  });

module.exports = CanvasRenderer;