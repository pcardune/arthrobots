/*global jest describe it expect*/
jest.dontMock('../Class')
jest.dontMock('../Robot')
jest.dontMock('../World')
jest.dontMock('../WorldParser')

const World = require('../World').default
const WorldParser = require('../WorldParser').default
const getParser = function(lines) {
  return new WorldParser(lines, new World())
}

describe('world parser', function() {

  it("should parse the robot line definition", function(){
    var parser = getParser(['Robot 1 4 E 5'])
    parser.parse()
    expect(parser.world.robot.x).toBe(1)
    expect(parser.world.robot.y).toBe(4)
    expect(parser.world.robot.direction).toBe('EAST')
    expect(parser.world.robot.beepers).toBe(5)
  })

  it("should parse the wall definition", function(){
    var parser = getParser(['Wall 1 4 E 4'])
    parser.parse()
    expect(parser.world.getWall(1,4,'EAST')).toBeTruthy()
    expect(parser.world.getWall(1,5,'EAST')).toBeTruthy()
    expect(parser.world.getWall(1,6,'EAST')).toBeTruthy()
    expect(parser.world.getWall(1,7,'EAST')).toBeTruthy()
    expect(parser.world.getWall(1,8,'EAST')).toBeFalsy()

    parser = getParser(['Wall 1 4 E'])
    parser.parse()
    expect(parser.world.getWall(1,4,'EAST')).toBeTruthy()
    expect(parser.world.getWall(1,5,'EAST')).toBeFalsy()
  })

  it("should parse the beeper definition", function(){
    var parser = getParser(['Beepers 3 3 2'])
    parser.parse()
    expect(parser.world.getBeepers(3,3), 2).toBeTruthy()
  })

  it("should skip comments", function(){
    var parser = getParser(['#this is a comment',
                   'Robot 4 4 N 5 #foo'])
    parser.parse()
    expect(parser.world.robot.x).toBe(4)
    expect(parser.world.robot.y).toBe(4)
    expect(parser.world.robot.beepers).toBe(5)
  })

})