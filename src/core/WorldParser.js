/**
 * regex for any coordinate (x, y, direction) specification for an object.
 * This is used to match both:
 *   ROBOT 5 5 N 3 #a robot at (5, 5) facing North with 3 beepers.
 * and
 *   WALL 5 5 E 2 #2 walls eastern walls starting at 5,5 going north.
 * @constant
 */
const SPEC = /^\s*(\w+)\s+(\d+)\s+(\d+)\s+([NESW])(\s+\d+)?\s*$/

/**
 * regex for beepers.  Should match something like:
 *   BEEPERS 1 2 5
 * which means 5 beepers at coordinates (1,2)
 * @constant
 */
const BEEPERS = /^\s*(\w+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$/

/**
 * @constant
 */
const EMPTY_LINE = /^\s*$/

var removeComment = function(line){
  var commentStart = line.indexOf('#')
  if (commentStart >= 0){
    line = line.slice(0, commentStart)
  }
  return line
}

export default class WorldParser {
  /**
   * @class parse lines into a world.
   * @constructs
   * @param lines See {@link WorldParser#lines}
   * @param world See {@link WorldParser#world}
   */
  constructor(lines, world){
    /**
     * The lines to parse
     * @type Array
     */
    this.lines = lines

    /**
     * The world to update with the results of parsing.
     * @type gvr.world.World
     */
    this.world = world
  }

  /**
   * parse the lines in the world.
   */
  parse(){
    var name,xCoord,yCoord,count
    for (var i =0; i < this.lines.length; i++){
      var line = removeComment(this.lines[i])
      if (line.match(EMPTY_LINE)){
        continue
      }
      var specMatch = line.match(SPEC)
      if (specMatch){
        name = specMatch[1].toUpperCase()
        xCoord = parseInt(specMatch[2],10)
        yCoord = parseInt(specMatch[3],10)
        var direction = {N:"NORTH",S:"SOUTH",E:"EAST",W:"WEST"}[specMatch[4]]
        count = parseInt(specMatch[5],10)
        if (isNaN(count)) {
          count = 0
        }
        if (name === "ROBOT"){
          this.world.robot.x = xCoord
          this.world.robot.y = yCoord
          this.world.robot.beepers = count
          this.world.robot.direction = direction
        }
        if (name === "WALL"){
          this.world.setWall(xCoord, yCoord, direction, count)
        }
      }
      var beepersMatch = line.match(BEEPERS)
      if (beepersMatch){
        name = beepersMatch[1].toUpperCase()
        if (name == "BEEPERS"){
          xCoord = parseInt(beepersMatch[2],10)
          yCoord = parseInt(beepersMatch[3],10)
          count =  parseInt(beepersMatch[4],10)
          this.world.setBeepers(xCoord, yCoord, count)
        }
      }

    }
  }
}
