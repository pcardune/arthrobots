jest.dontMock('../../core/Class');
jest.dontMock('../../robot/robot');
jest.dontMock('../../world/world');
jest.dontMock('../lang');
jest.dontMock('../parser');

describe('lang parser', function() {

  beforeEach(function(){
    gvr = {lang:require('../lang'), world:require('../../world/world'), robot:require('../../robot/robot')}
    gvr.lang.parser = require('../parser');
    getParser = function(lines) {
      return gvr.lang.parser.newParser(lines, (new gvr.world.World()).robot);
    }
  });

  it("testCommand", function(){
    var block = getParser(['move']).parse();
    expect(block.expressions.length).toBe(1);
    expect(block.expressions[0].callable).toBe(new gvr.robot.Robot().move);
    expect(block.expressions[0].line).toBe(0);
  });

  it("testDo", function(){
    var block = getParser(['do 3:',
                  '  move']).parse();
    expect(block.expressions.length).toBe(1);
    expect(block.expressions[0].callable).toBe(new gvr.robot.Robot()["do"]);
    expect(block.expressions[0].line).toBe(0);
    expect(block.expressions[0].block.expressions.length).toBe(1);
    expect(block.expressions[0].count).toBe(3);
    expect(block.expressions[0].block.expressions[0].callable).toBe(new gvr.robot.Robot().move);
  });

  it("testIf", function(){
    var block = getParser(['if front_is_clear:',
                  '  move']).parse();
    expect(block.expressions.length).toBe(1);
    expect(block.expressions[0].name).toBe('if');
    expect(block.expressions[0].callable).toBe(new gvr.robot.Robot().front_is_clear);
    expect(block.expressions[0].line).toBe(0);
    expect(block.expressions[0].block.expressions.length).toBe(1);
    expect(block.expressions[0].block.expressions[0].callable).toBe(new gvr.robot.Robot().move);
    expect(block.expressions[0].block.expressions[0].line).toBe(1);
  });

  it("testElse", function(){
    var block = getParser(['if front_is_clear:',
                  '  move',
                  'else:',
                  '  turnleft']).parse();
    expect(block.expressions.length).toBe(1);
    expect(block.expressions[0].name).toBe('if');
    expect(block.expressions[0].callable).toBe(new gvr.robot.Robot().front_is_clear);
    expect(block.expressions[0].line).toBe(0);
    expect(block.expressions[0].block.expressions.length).toBe(1);
    expect(block.expressions[0].block.expressions[0].callable).toBe(new gvr.robot.Robot().move);
    expect(block.expressions[0].block.expressions[0].line).toBe(1);
    expect(block.expressions[0].elseBlock.expressions.length).toBe(1);
    expect(block.expressions[0].elseBlock.expressions[0].callable).toBe(new gvr.robot.Robot().turnleft);
    expect(block.expressions[0].elseBlock.expressions[0].line).toBe(3);
  });

  it("testElif", function(){
    var block = getParser(['if front_is_clear:',
                  '  move',
                  'elif facing_north:',
                  '  putbeeper',
                  'elif facing_south:',
                  '  pickbeeper',
                  'else:',
                  '  turnleft']).parse();
    expect(block.expressions.length).toBe(1);
    expect(block.expressions[0].elifs.length).toBe(2);
    expect(block.expressions[0].elifs[0].callable).toBe(new gvr.robot.Robot().facing_north);
    expect(block.expressions[0].elifs[0].line).toBe(2);
    expect(block.expressions[0].elifs[1].callable).toBe(new gvr.robot.Robot().facing_south);
    expect(block.expressions[0].elifs[1].line).toBe(4);
  });

  it("testWhile", function(){
    var block = getParser(['while front_is_clear:',
                  '  move']).parse();
    expect(block.expressions.length).toBe(1);
    expect(block.expressions[0].name).toBe('while');
    expect(block.expressions[0].callable).toBe(new gvr.robot.Robot().front_is_clear);
    expect(block.expressions[0].line).toBe(0);
    expect(block.expressions[0].block.expressions.length).toBe(1);
    expect(block.expressions[0].block.expressions[0].callable).toBe(new gvr.robot.Robot().move);
    expect(block.expressions[0].block.expressions[0].line).toBe(1);
  });

  it("testDefine", function(){
    var block = getParser(['define turnright:',
                  '  do 3:',
                  '  turnleft']).parse();
    expect(block.expressions.length).toBe(1);
    expect(block.expressions[0].name).toBe('turnright');
    expect(block.expressions[0].line).toBe(0);
    expect(block.expressions[0].block.expressions.length).toBe(1);
    expect(block.expressions[0].block.expressions[0].line).toBe(1);
    expect(block.expressions[0].block.expressions[0].count).toBe(3);
    expect(block.expressions[0].block.expressions[0].block.expressions[0].callable).toBe(new gvr.robot.Robot().turnleft);
  });

  it("testFunctionCall", function(){
    var block = getParser(['define turnright:',
                  '  do 3:',
                  '  turnleft',
                  'turnright']).parse();
    expect(block.expressions.length).toBe(2);
    expect(block.expressions[1].fname).toBe('turnright');
  });

  it("testMultilineBlock", function(){
    var block = getParser(['while front_is_clear:',
                  '  move',
                  '  move',
                  '  turnleft',
                  'move']).parse();
    expect(block.expressions.length).toBe(2);
    expect(block.expressions[0].block.expressions.length).toBe(3);
  });

  it("testSyntaxError", function(){
    var parser = getParser(['do n: move']);
    try{
      parser.parse();
    } catch (e){
      expect(e.message).toBe("Syntax Error on line 1: do n: move");
    }
  });
});
