jest.dontMock('../Class');
jest.dontMock('../lang');

var lang = require('../lang')

describe('lang Expression', function() {

  /**
   * The most atomic part of a code execution path is an
   * expression. An expression simply calls a passed in function with a
   * given scope and returns an empty stack (i.e. there is nothing left
   * to do.)
   */
  it('should call the associated function and return an empty stack',
    function() {
      var calledWith;
      var scope = {a: 1};
      function func(){
        calledWith = this;
      }
      var expression = new lang.Expression(1, func, scope);
      var next = expression.step({}, {});
      expect(calledWith).toBe(scope);
      expect(next.length).toBe(0);
    });

  /**
   * The next level up after expressions are blocks. These are
   * essentially just a grouping of expression objects.
   */
  it('should work with blocks', function(){
    var log = [];
    var block = new lang.Block([
      new lang.Expression(1, function(){ log.push(1); }, this)
    ]);
    // step over the block once, it will finish
    var next = block.step({}, {});
    expect(log[0]).toBe(1);
    expect(next.length).toBe(1);
    // if the block is finished, and we step onto it, it will reset.
    next = next[0].instruction.step({}, next[0].context);
    expect(log[0]).toBe(1);
    expect(log.length).toBe(1);
    expect(next.length).toBe(0);
    // now it goes back to the beginning.
    next = block.step({}, {});
    expect(log[1]).toBe(1);
    expect(next.length).toBe(1);
  });

  xit("should work with blocks that have multiple expressions", function() {
    var log = [];
    var block = new lang.Block(
      [
        new lang.Expression(1, function(){ log.push("one"); }, this),
        new lang.Expression(2, function(){ log.push("two"); }, this),
        new lang.Expression(3, function(){ log.push("three"); }, this)
      ]);
    // execute the first step
    var next = block.step({}, {});
    expect(log[0]).toBe("one");
    expect(next.length).toBe(1);
    expect(next[0]).toBe(block);
    // execute the second step
    next = block.step({}, {});
    expect(log[1]).toBe("two");
    expect(next.length).toBe(1);
    expect(next[0]).toBe(block);
    // execute the third step
    next = block.step({}, {});
    expect(log[2]).toBe("three");
    expect(next.length).toBe(1);
    // the next time we step on the block, it resets.
    next = block.step({}, {});
    expect(log.length).toBe(3);
    expect(next.length).toBe(0);
  });

  xit("should work with if statements", function(){
    var log = [];
    var nextCond = true;
    function condition(){
      return nextCond;
    }
    var ifExpr = new lang.If(1, condition, {},
      [new lang.Expression(2, function(){ log.push("one"); }, this)]
    );
    var next = ifExpr.step({}, {});
    expect(next.length).toBe(1);
    expect(log.length).toBe(1);
    expect(log[0],"one");
    next[0].step({}, {});
    next = ifExpr.step({}, {});
    expect(log.length).toBe(2);
    next[0].step({}, {});
    nextCond = false;
    next = ifExpr.step({}, {});
    expect(log.length).toBe(2);
  });

  xit("should work with else statements", function() {
    var log = [];
    var nextCond = true;
    function condition(){
      return nextCond;
    }
    var ifExpr = new lang.If(1, condition, {}, [new lang.Expression(2, function(){ log.push("one"); }, this)]);
    ifExpr.elseBlock.expressions.push(new lang.Expression(2, function(){ log.push("two"); }, this));
    var next = ifExpr.step({}, {});
    expect(next.length).toBe(1);
    expect(log.length).toBe(1);
    expect(log[0],"one");
    next[0].step({}, {});
    nextCond = false;
    next = ifExpr.step({}, {});
    expect(log.length).toBe(2);
    expect(log[1],"two");
    expect(next.length).toBe(1);
    next[0].step({}, {});
  });

  xit('should work with elif statements', function() {
    var log = [];
    var a = true;
    var b = true;
    var c = true;
    var ifExpr = new lang.If(      1, function(){return a;}, {}, [
             new lang.Expression(2, function(){ log.push("a"); }, this)]);
    ifExpr.elifs.push(
           new lang.If(      3, function(){return b;}, {}, [
             new lang.Expression(4, function(){ log.push("b"); }, this)]));
    ifExpr.elifs.push(
           new lang.If(      5, function(){return c;}, {}, [
             new lang.Expression(6, function(){ log.push("c"); }, this)]));
    // testing if catch
    var next = ifExpr.step({}, {});
    expect(next.length).toBe(1);
    expect(log.length).toBe(1);
    expect(log[0],"a");
    next[0].step({}, {});
    // testing first elif catch
    a = false;
    next = ifExpr.step({}, {});
    expect(log.length).toBe(2);
    expect(log[1],"b");
    // testing second elif catch
    b = false;
    next = ifExpr.step({}, {});
    expect(log.length).toBe(3);
    expect(log[2],"c");
    c = false;
    next = ifExpr.step({}, {});
    expect(log.length).toBe(3);
    expect(log[2],"c");
    ifExpr.elseBlock.expressions.push(
             new lang.Expression(7, function(){ log.push("else"); }, this));
    // testing else catch
    next = ifExpr.step({}, {});
    expect(log.length).toBe(4);
    expect(log[3],"else");
  });

});
