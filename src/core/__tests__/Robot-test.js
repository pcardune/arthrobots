jest.dontMock('../Class');
jest.dontMock('../World');
jest.dontMock('../Robot');

var Robot = require('../Robot');
var World = require('../World');
window.alert = jest.genMockFunction();
var keysOf = function(obj){
  var keys = [];
  var key;
  for (key in obj){
    keys.push(key);
  }
  return keys;
};

describe('Robot', function() {

  it("testMove", function() {
    var w = new World();
    expect(w.robot.x).toBe(1);
    expect(w.robot.y).toBe(1);
    expect(w.robot.direction).toBe('NORTH');
    w.robot.move();
    expect(w.robot.x).toBe(1);
    expect(w.robot.y).toBe(2);
  });

  it("testMoveFailure", function() {
    var w = new World();
    w.robot.front_is_blocked = function(){
      return true;
    };
    try{
      w.robot.move();
    } catch (e){
      expect(e.message).toBe("Ran into a wall");
    }
  });

  it("testTurnLeft", function () {
    var w = new World();
    expect(w.robot.direction).toBe('NORTH');
    w.robot.turnleft();
    expect(w.robot.direction).toBe('WEST');
    w.robot.turnleft();
    expect(w.robot.direction).toBe('SOUTH');
    w.robot.turnleft();
    expect(w.robot.direction).toBe('EAST');
  });

  it("testPickBeeper", function (){
    var w = new World();
    w.setBeepers(1,1,2);
    expect(w.robot.beepers).toBe(0);
    w.robot.pickbeeper();
    expect(w.robot.beepers).toBe(1);
    expect(w.getBeepers(1,1)).toBe(1);
    w.robot.pickbeeper();
    expect(w.getBeepers(1,1)).toBe(0);
    try{
      w.robot.pickbeeper();
    } catch (e){
      expect(e.message).toBe("No beepers to pick up.");
    }
  });

  it("testPutBeeper", function (){
    var w = new World();
    w.robot.beepers = 2;
    expect(w.robot.beepers).toBe(2);
    expect(w.getBeepers(1,1)).toBe(0);
    w.robot.putbeeper();
    expect(w.getBeepers(1,1)).toBe(1);
    expect(w.robot.beepers).toBe(1);
    w.robot.putbeeper();
    try{
      w.robot.putbeeper();
    } catch (e){
      expect(e.message).toBe("No beepers in beeper bag.");
    }
  });

  it("testTurnOff", function(){
    var w = new World();
    expect(w.robot.on).toBeTruthy();;
    w.robot.turnoff();
    expect(w.robot.on).toBeFalsy();
  });

  it("testDirectionConditionals", function(){
    var w = new World();
    expect(w.robot.not_facing_east()).toBeTruthy();
    expect(w.robot.facing_north()).toBeTruthy();
    w.robot.turnleft();
    expect(w.robot.not_facing_north()).toBeTruthy();
    expect(w.robot.facing_west()).toBeTruthy();
    w.robot.turnleft();
    expect(w.robot.not_facing_west()).toBeTruthy();
    expect(w.robot.facing_south()).toBeTruthy();
    w.robot.turnleft();
    expect(w.robot.not_facing_south()).toBeTruthy();
    expect(w.robot.facing_east()).toBeTruthy();
  });

  it("testBeeperConditions", function(){
    var w = new World();
    expect(w.robot.beepers).toBe(0);
    expect(w.robot.no_beepers_in_beeper_bag()).toBeTruthy();
    w.robot.beepers = 1;
    expect(w.robot.any_beepers_in_beeper_bag()).toBeTruthy();
    expect(w.robot.not_next_to_a_beeper()).toBeTruthy();
    w.robot.putbeeper();
    expect(w.robot.next_to_a_beeper()).toBeTruthy();
  });

  it("testWallConditions", function(){
    var w = new World();
    // facing north
    expect(w.robot.front_is_clear()).toBeTruthy();
    w.setWall(1, 1, 'NORTH', 1);
    expect(w.robot.front_is_blocked()).toBeTruthy();
    expect(w.robot.left_is_blocked()).toBeTruthy();
    expect(w.robot.right_is_clear()).toBeTruthy();
    // facing west
    w.robot.turnleft();
    expect(w.robot.front_is_blocked()).toBeTruthy();
    expect(w.robot.left_is_blocked()).toBeTruthy();
    expect(w.robot.right_is_blocked()).toBeTruthy();
    // facing south
    w.robot.turnleft();
    expect(w.robot.front_is_blocked()).toBeTruthy();
    expect(w.robot.left_is_clear()).toBeTruthy();
    expect(w.robot.right_is_blocked()).toBeTruthy();
    //facing east
    w.robot.turnleft();
    expect(w.robot.front_is_clear()).toBeTruthy();
    expect(w.robot.left_is_blocked()).toBeTruthy();
    expect(w.robot.right_is_blocked()).toBeTruthy();
  });

});