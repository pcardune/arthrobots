jest.dontMock('../Class');
jest.dontMock('../Robot');
jest.dontMock('../World');

var World = require('../World');
var keysOf = function(obj){
  var keys = [];
  for (key in obj){
    keys.push(key);
  }
  return keys;
}

describe('World', function() {

  it("should be constructed with some defaults", function() {
    var w = new World();
    expect(keysOf(w.walls).length, 0);
    expect(keysOf(w.beepers).length).toBe(0);
    expect(w.robot.x).toBe(1);
    expect(w.robot.y).toBe(1);
  });

  it("should be able to set and get beepers", function() {
    var w = new World();
    expect(w.getBeepers(5,5)).toBe(0);
    w.setBeepers(5,5,10);
    expect(w.getBeepers(5,5)).toBe(10);
  });

  it("should be able to set and get walls", function(){
    var w = new World();
    expect(w.getWall(5,5, 'NORTH')).toBe(false);
    w.setWall(5, 5, 'NORTH');
    expect(w.getWall(5,5, 'NORTH')).toBe(true);
  });

  it("should have a world boundary", function() {
    var w = new World();
    expect(w.getWall(5,1, 'SOUTH')).toBe(true);
    expect(w.getWall(1,5, 'WEST')).toBe(true);
  });

  it("should have setWall work with multiple walls", function(){
    var w = new World();
    w.setWall(7, 7, 'NORTH', 3);
    expect(w.getWall(7,7, 'NORTH')).toBe(true);
    expect(w.getWall(8,7, 'NORTH')).toBe(true);
    expect(w.getWall(9,7, 'NORTH')).toBe(true);
    w.setWall(7, 7, 'SOUTH', 3);
    expect(w.getWall(7,7, 'SOUTH')).toBe(true);
    expect(w.getWall(6,7, 'SOUTH')).toBe(true);
    expect(w.getWall(5,7, 'SOUTH')).toBe(true);
    w.setWall(7, 7, 'EAST', 3);
    expect(w.getWall(7,7, 'EAST')).toBe(true);
    expect(w.getWall(7,8, 'EAST')).toBe(true);
    expect(w.getWall(7,9, 'EAST')).toBe(true);
    w.setWall(7, 7, 'WEST', 3);
    expect(w.getWall(7,7, 'WEST')).toBe(true);
    expect(w.getWall(7,6, 'WEST')).toBe(true);
    expect(w.getWall(7,5, 'WEST')).toBe(true);
  });

  it("should work with getting wall coordinates from north and south", function() {
    var w = new World();
    var coords = w.getWallCoordinates(2, 2, 'NORTH');
    expect(coords.x).toBe(2);
    expect(coords.y).toBe(2);
    expect(coords.direction).toBe('NORTH');
    var coords2 = w.getWallCoordinates(2, 3, 'SOUTH');
    expect(coords.x).toBe(coords2.x);
    expect(coords.y).toBe(coords2.y);
    expect(coords.direction).toBe(coords2.direction);
  });

  it("should work with getting wall coordinates from east and west", function() {
    var w = new World();
    var coords = w.getWallCoordinates(2, 2, 'EAST');
    expect(coords.x).toBe(2);
    expect(coords.y).toBe(2);
    expect(coords.direction).toBe('EAST');
    var coords2 = w.getWallCoordinates(3, 2, 'WEST');
    expect(coords.x).toBe(coords2.x);
    expect(coords.y).toBe(coords2.y);
    expect(coords.direction).toBe(coords2.direction);
  });

});
