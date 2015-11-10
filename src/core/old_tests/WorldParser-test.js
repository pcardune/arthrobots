jest.dontMock('../Class');
jest.dontMock('../robot');
jest.dontMock('../parser');
jest.dontMock('../World');
jest.dontMock('../WorldParser');

describe('world parser', function() {

  beforeEach(function(){
    World = require('../World');
    gvr = {
      robot:require('../robot')
    }
    WorldParser = require('../WorldParser');
    gvr.debug = jest.genMockFunction();
    getParser = function(lines) {
      return new WorldParser(lines, new World());
    }
  });

  it("testRobot", function(){
    var parser = getParser(['Robot 1 4 E 5']);
    parser.parse();
    expect(parser.world.robot.x).toBe(1);
    expect(parser.world.robot.y).toBe(4);
    expect(parser.world.robot.direction).toBe('EAST');
    expect(parser.world.robot.beepers).toBe(5);
  });

  it("testWall", function(){
    var parser = getParser(['Wall 1 4 E 4']);
    parser.parse();
    expect(parser.world.getWall(1,4,'EAST')).toBeTruthy()
    expect(parser.world.getWall(1,5,'EAST')).toBeTruthy()
    expect(parser.world.getWall(1,6,'EAST')).toBeTruthy()
    expect(parser.world.getWall(1,7,'EAST')).toBeTruthy()
    expect(parser.world.getWall(1,8,'EAST')).toBeFalsy()
  });

  it("testBeeper", function(){
    var parser = getParser(['Beepers 3 3 2']);
    parser.parse();
    expect(parser.world.getBeepers(3,3), 2).toBeTruthy()
  });

  it("testComment", function(){
    var parser = getParser(['#this is a comment',
                   'Robot 4 4 N 5 #foo']);
    parser.parse();
    expect(parser.world.robot.x).toBe(4);
    expect(parser.world.robot.y).toBe(4);
    expect(parser.world.robot.beepers).toBe(5);
  });

});