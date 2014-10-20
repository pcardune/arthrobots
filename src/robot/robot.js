/**
 * @name gvr.robot
 * @namespace namespace for everything having to do with the robot.
 */
var Class = require('../core/Class');
var gvr = {robot:{}};
/**
 * The north direction
 * @static
 */
gvr.robot.NORTH = 'NORTH';

/**
 * The west direction
 * @static
 */
gvr.robot.WEST  = 'WEST';

/**
 * the south direction
 * @static
 */
gvr.robot.SOUTH = 'SOUTH';

/**
 * the east direction
 * @static
 */
gvr.robot.EAST  = 'EAST';

/**
 * Hash for finding the direction to the immediate left of the given direction.
 * @static
 */
gvr.robot.LEFT_OF = {};
gvr.robot.LEFT_OF[gvr.robot.NORTH] = gvr.robot.WEST;
gvr.robot.LEFT_OF[gvr.robot.WEST ] =  gvr.robot.SOUTH;
gvr.robot.LEFT_OF[gvr.robot.SOUTH] = gvr.robot.EAST;
gvr.robot.LEFT_OF[gvr.robot.EAST ] =  gvr.robot.NORTH;


/**
 * offsets which translate direction into cartesian coordinate offsets.
 * @static
 */
gvr.robot.OFFSET = {
  NORTH: {x:0, y:1},
  SOUTH: {x:0, y:-1},
  EAST:  {x:1,y:0},
  WEST:  {x:-1, y:0}
};

gvr.robot.Robot = Class.extend(
  /** @lends gvr.robot.Robot# */
  {
    /**
     * @class Represents a robot.
     * @constructs
     * @param world See {@link gvr.robot.Robot#world}
     */
    init: function(world){
      /**
       * The x coordinate of the robot.
       * @type int
       */
      this.x = 1;

      /**
       * The y coordinate of the robot.
       * @type int
       */
      this.y = 1;

      /**
       * The world the robot lives in.
       * @type gvr.world.World
       */
      this.world = world;

      /**
       * The direction the robot is facing.
       * One of {@link gvr.robot.NORTH}
       *    {@link gvr.robot.SOUTH}
       *    {@link gvr.robot.EAST}
       *   or {@link gvr.robot.WEST}
       */
      this.direction = gvr.robot.NORTH;

      /**
       * The number of beepers that the robot is carrying.
       * @type int
       */
      this.beepers = 0;

      /**
       * Whether or not the robot is turned on.
       * @type boolean
       */
      this.on = true;
    },

    /**
     * move the robot one coordinate point in the direction the robot is facing.
     * If a wall is in front of the robot, this method throws an error.
     */
    move: function move(){
      if (this.front_is_blocked()){
        throw new Error("Ran into a wall");
      }
      var offset = gvr.robot.OFFSET[this.direction];
      this.x += offset.x;
      this.y += offset.y;
    },

    /**
     * Turn the robot left.
     */
    turnleft: function turnleft(){
      this.direction = gvr.robot.LEFT_OF[this.direction];
    },


    /**
     * Pick up a beeper from the current location of the robot.
     * If there are no beepers in the world at the robot's current location,
     * an error is thrown.
     */
    pickbeeper: function pickbeeper(){
      var beepers = this.world.getBeepers(this.x, this.y);
      if (beepers > 0){
        this.beepers += 1;
        this.world.setBeepers(this.x, this.y, beepers-1);
      } else {
        throw new Error("No beepers to pick up.");
      }
    },

    /**
     * Put a beeper down in the world where the robot is located.
     * If the robot does not currently have any beepers, an error is thrown.
     */
    putbeeper: function putbeeper(){
      if (this.beepers > 0){
        this.beepers -= 1;
        this.world.setBeepers(
          this.x, this.y,
          this.world.getBeepers(this.x,this.y)+1);
      } else {
        throw new Error("No beepers in beeper bag.");
      }
    },

    /**
     * turn the robot off.
     */
    turnoff: function turnoff(){
      this.on = false;
      alert("Robot turned off");
    },

    /**
     * @returns true if the robot is facing north.
     */
    facing_north: function facing_north(){
      return this.direction === gvr.robot.NORTH;
    },
    /**
     * @returns true if the robot is facing south
     */
    facing_south: function facing_south(){
      return this.direction === gvr.robot.SOUTH;
    },
    /**
     * @returns true if the robot is facing east
     */
    facing_east: function facing_east(){
      return this.direction === gvr.robot.EAST;
    },
    /**
     * @returns true if the robot is facing west
     */
    facing_west: function facing_west(){
      return this.direction === gvr.robot.WEST;
    },

    /**
     * @returns true if the robot has any beepers
     */
    any_beepers_in_beeper_bag: function any_beepers_in_beeper_bag(){
      return this.beepers > 0;
    },

    /**
     * @returns true if the world has any beepers at the robot's currently location.
     */
    next_to_a_beeper: function next_to_a_beeper(){
      return this.world.getBeepers(this.x, this.y) > 0;
    },

    /**
     * @returns true if there is a wall in front of the robot.
     */
    front_is_blocked: function front_is_blocked(){
      return this.world.getWall(this.x, this.y, this.direction);
    },
    /**
     * @returns true of there is a wall to the left of the robot.
     */
    left_is_blocked: function left_is_blocked(){
      return this.world.getWall(
        this.x, this.y, gvr.robot.LEFT_OF[this.direction]);
    },
    /**
     * returns true if there is a wall to the right of the robot.
     */
    right_is_blocked: function right_is_blocked(){
      var direction = gvr.robot.LEFT_OF[gvr.robot.LEFT_OF[gvr.robot.LEFT_OF[this.direction]]];
      return this.world.getWall(this.x, this.y, direction);
    },

    /**
     * The opposite of {@link gvr.robot.Robot#facing_north}
     */
    not_facing_north: function(){
      return !this.facing_north();
    },

    /**
     * The opposite of {@link gvr.robot.Robot#facing_south}
     */
    not_facing_south: function(){
      return !this.facing_south();
    },

    /**
     * The opposite of {@link gvr.robot.Robot#facing_east}
     */
    not_facing_east:  function(){
      return !this.facing_east();
    },

    /**
     * The opposite of {@link gvr.robot.Robot#facing_west}
     */
    not_facing_west: function(){
      return !this.facing_west();
    },

    /**
     * The opposite of {@link gvr.robot.Robot#any_beepers_in_beeper_bag}
     */
    no_beepers_in_beeper_bag: function no_beepers_in_beeper_bag(){
      return !this.any_beepers_in_beeper_bag();
    },

    /**
     * The opposite of {@link gvr.robot.Robot#next_to_a_beeper}
     */
    not_next_to_a_beeper: function not_next_to_a_beeper(){
      return !this.next_to_a_beeper();
    },

    /**
     * The opposite of {@link gvr.robot.Robot#front_is_blocked}
     */
    front_is_clear: function front_is_clear(){
      return !this.front_is_blocked();
    },

    /**
     * The opposite of {@link gvr.robot.Robot#left_is_blocked}
     */
    left_is_clear: function left_is_clear(){
      return !this.left_is_blocked();
    },

    /**
     * The opposite of {@link gvr.robot.Robot#right_is_blocked}
     */
    right_is_clear: function right_is_clear(){
      return !this.right_is_blocked();
    }

  });

module.exports = gvr.robot;