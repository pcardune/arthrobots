var Class = require('./Class');
var Robot = require('./Robot');

var World = Class.extend(
  /** @lends World# */
  {
    /**
     * @class Represents the state of the world that GvR lives in.
     * @constructs
     */
    init: function(){
      /**
       * The robot within the world. Currently only one robot at a time
       * is supported.
       * @type Robot
       */
      this.robot = new Robot(this);

      /**
       * The walls in the world.  This is represented as an object
       * with keys of the form "x,y" and values that are another map
       * from north or east directions to a boolean.  A set of walls that
       * forms a square in the world would be represented like this:
       *
       *   {"2,2": {NORTH: true,  EAST: true},
       *  "1,2": {NORTH: false, EAST: true},
       *  "2,1": {NORTH: true,  EAST: false}}
       * @type Object
       */
      this.walls = {};

      /**
       * The beepers in the world.  This is represented as an object
       * with keys of the form "x,y" and values as the number of beepers
       * at that location.
       * @type Object
       */
      this.beepers = {};
    },
    /**
     * Sets the number of beepers at a particular location in the world.
     * @param x The x coordinate
     * @param y The y coordinate
     * @param numBeepers the number of beepers at the given coordinates.
     */
    setBeepers: function(x, y, numBeepers){
      if (numBeepers !== null){
        this.beepers[''+x+','+y] = numBeepers;
      } else {
        delete this.beepers[''+x+','+y];
      }
    },

    /**
     * Get the number of beepers at the given coordinate
     * @param x The x coordinate
     * @param y The y coordinate
     * @returns int
     */
    getBeepers: function(x, y){
      return this.beepers[''+x+','+y] || 0;
    },

    /**
     * Normalize wall coordinates by direction.  Will return the correct
     * coordinates for any wall normalized to east and north direction.
     * @private
     * @returns Object of the form of {x:x, y:y, direction:direction}
     */
    getWallCoordinates: function(x, y, direction){
      if (direction === Robot.WEST){
        direction = Robot.EAST;
        x -= 1;
      } else if (direction === Robot.SOUTH){
        direction = Robot.NORTH;
        y -= 1;
      }
      return {x:x, y:y, direction:direction};
    },

    /**
     * Sets the number of walls at a particular coordinate.
     * @param x The x coordinate
     * @param y The y coordinate
     * @param direction The direction (one of "NORTH", "SOUTH", "EAST", or "WEST").
     *          Its a good idea to use the constants defined in {@link gvr.robot}
     * @param count The number of walls to put at this location.  Usually just 1.
     *        If more than one, walls will extend out in the direction to the
     *        left of the given direction.
     * @example
     * calling
     *
     *      world.setWall(2, 2, "NORTH", 3);
     *
     * is equivalent to
     *
     *      for (var i=0; i < 2; i++){
     *      world.setWall(2+i, 2, "NORTH", 1);
     *      }
     */
    setWall: function(x, y, direction, count){
      var coords = this.getWallCoordinates(x, y, direction);
      var key = ''+coords.x+','+coords.y;
      if (!this.walls[key]){
        this.walls[key] = {NORTH:false, EAST:false};
      }
      this.walls[key][coords.direction] = true;
      if (count !== null && count > 1){
        var offset = Robot.OFFSET[direction];
        this.setWall(x+offset.y, y+offset.x, direction, count-1);
      }
    },


    /**
     * Return the state of the wall at the given location and direction.
     * @param x The x coordinate
     * @param y The y coordinate
     * @param direction The direction.  One of "NORTH", "SOUTH", "EAST", "WEST".
     *          It is a good idea to use the constants defined in {@link gvr.robot}
     * @returns Boolean
     */
    getWall: function(x, y, direction){
      var coords = this.getWallCoordinates(x, y, direction);
      var wall = this.walls[''+coords.x+','+coords.y];
      return (wall && wall[coords.direction]) ||
        (coords.x === 0 && coords.direction === Robot.EAST) ||
        (coords.y === 0 && coords.direction === Robot.NORTH) ||
        false;
    },

    /**
     * Return whether or not this world looks the same as another world. Right now it only checks
     * robot and beepers.
     */
    isEqualTo: function(world) {
      var robotsEqual = (
        world.robot.x == this.robot.x &&
        world.robot.y == this.robot.y &&
        world.robot.direction == this.robot.direction
      );
      if (!robotsEqual) {
        return false;
      }
      for (var key in this.beepers) {
        if ((world.beepers[key] || 0) != (this.beepers[key] || 0)) {
          return false;
        }
      }
      for (var key in world.beepers) {
        if ((world.beepers[key] || 0) != (this.beepers[key] || 0)) {
          return false;
        }
      }
      return true;
    }
  });

module.exports = World;