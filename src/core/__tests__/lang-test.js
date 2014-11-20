jest.dontMock('../Class');
jest.dontMock('../lang');

describe('lang Expression', function() {

  beforeEach(function(){
    gvr = {lang:require('../lang')};
  });

  /**
   * The most atomic part of a code execution path is an
   * expression. An expression simply calls a passed in function with a
   * given scope and returns an empty stack (i.e. there is nothing left
   * to do.)
   */
  it('should call the associated function and return an empty stack',
    function() {
      var lang = require('../lang');
      var calledWith;
      var scope = {a: 1};
      function func(){
        calledWith = this;
      }
      var expression = gvr.lang.newExpression(1, func, scope);
      var next = expression.step();
      expect(calledWith).toBe(scope);
      expect(next.length).toBe(0);
    });

  /**
   * The next level up after expressions are blocks. These are
   * essentially just a grouping of expression objects.
   */
  it('should work with blocks', function(){
    var log = [];
    var block = new gvr.lang.Block([
      gvr.lang.newExpression(1, function(){ log.push(1); }, this)
    ]);
    // step over the block once, it will finish
    expect(block.currentStep).toBe(0);
    var next = block.step();
    expect(log[0]).toBe(1);
    expect(next.length).toBe(1);
    expect(block.currentStep).toBe(1);
    // if the block is finished, and we step onto it, it will reset.
    next = block.step();
    expect(log[0]).toBe(1);
    expect(log.length).toBe(1);
    expect(next.length).toBe(0);
    expect(block.currentStep).toBe(0);
    // now it goes back to the beginning.
    expect(block.currentStep).toBe(0);
    next = block.step();
    expect(log[1]).toBe(1);
    expect(next.length).toBe(1);
    expect(block.currentStep).toBe(1);
  });

  it("should work with blocks that have multiple expressions", function() {
    var log = [];
    var block = new gvr.lang.Block(
      [
        gvr.lang.newExpression(1, function(){ log.push("one"); }, this),
        gvr.lang.newExpression(2, function(){ log.push("two"); }, this),
        gvr.lang.newExpression(3, function(){ log.push("three"); }, this)
      ]);
    // execute the first step
    expect(block.currentStep).toBe(0);
    var next = block.step();
    expect(log[0]).toBe("one");
    expect(next.length).toBe(1);
    expect(next[0]).toBe(block);
    expect(block.currentStep).toBe(1);
    // execute the second step
    next = block.step();
    expect(log[1]).toBe("two");
    expect(next.length).toBe(1);
    expect(next[0]).toBe(block);
    expect(block.currentStep).toBe(2);
    // execute the third step
    next = block.step();
    expect(log[2]).toBe("three");
    expect(next.length).toBe(1);
    expect(block.currentStep).toBe(3);
    // the next time we step on the block, it resets.
    next = block.step();
    expect(log.length).toBe(3);
    expect(next.length).toBe(0);
    expect(block.currentStep).toBe(0);
  });

  it("should work with if statements", function(){
    var log = [];
    var nextCond = true;
    function condition(){
      return nextCond;
    }
    var ifExpr = gvr.lang.newIf(1, condition, {},
      [gvr.lang.newExpression(2, function(){ log.push("one"); }, this)]
    );
    expect(ifExpr.block.currentStep).toBe(0);
    var next = ifExpr.step();
    expect(next.length).toBe(1);
    expect(log.length).toBe(1);
    expect(log[0],"one");
    expect(ifExpr.block.currentStep).toBe(1);
    next[0].step();
    expect(ifExpr.block.currentStep).toBe(0);
    next = ifExpr.step();
    expect(log.length).toBe(2);
    next[0].step();
    nextCond = false;
    expect(ifExpr.block.currentStep).toBe(0);
    next = ifExpr.step();
    expect(log.length).toBe(2);
  });

  it("should work with else statements", function() {
    var log = [];
    var nextCond = true;
    function condition(){
      return nextCond;
    }
    var ifExpr = gvr.lang.newIf(1, condition, {}, [gvr.lang.newExpression(2, function(){ log.push("one"); }, this)]);
    ifExpr.elseBlock.expressions.push(gvr.lang.newExpression(2, function(){ log.push("two"); }, this));
    expect(ifExpr.block.currentStep).toBe(0);
    var next = ifExpr.step();
    expect(next.length).toBe(1);
    expect(log.length).toBe(1);
    expect(log[0],"one");
    expect(ifExpr.block.currentStep).toBe(1);
    next[0].step();
    expect(ifExpr.block.currentStep).toBe(0);
    nextCond = false;
    expect(ifExpr.elseBlock.currentStep).toBe(0);
    next = ifExpr.step();
    expect(log.length).toBe(2);
    expect(log[1],"two");
    expect(ifExpr.elseBlock.currentStep).toBe(1);
    expect(next.length).toBe(1);
    next[0].step();
    expect(ifExpr.elseBlock.currentStep).toBe(0);
  });

  it('should work with elif statements', function() {
    var log = [];
    var a = true;
    var b = true;
    var c = true;
    var ifExpr = gvr.lang.newIf(      1, function(){return a;}, {}, [
             gvr.lang.newExpression(2, function(){ log.push("a"); }, this)]);
    ifExpr.elifs.push(
           gvr.lang.newIf(      3, function(){return b;}, {}, [
             gvr.lang.newExpression(4, function(){ log.push("b"); }, this)]));
    ifExpr.elifs.push(
           gvr.lang.newIf(      5, function(){return c;}, {}, [
             gvr.lang.newExpression(6, function(){ log.push("c"); }, this)]));
    // testing if catch
    expect(ifExpr.block.currentStep).toBe(0);
    var next = ifExpr.step();
    expect(next.length).toBe(1);
    expect(log.length).toBe(1);
    expect(log[0],"a");
    expect(ifExpr.block.currentStep).toBe(1);
    next[0].step();
    expect(ifExpr.block.currentStep).toBe(0);
    // testing first elif catch
    a = false;
    expect(ifExpr.elifs[0].block.currentStep).toBe(0);
    next = ifExpr.step();
    expect(log.length).toBe(2);
    expect(log[1],"b");
    // testing second elif catch
    b = false;
    expect(ifExpr.elifs[1].block.currentStep).toBe(0);
    next = ifExpr.step();
    expect(log.length).toBe(3);
    expect(log[2],"c");
    c = false;
    next = ifExpr.step();
    expect(log.length).toBe(3);
    expect(log[2],"c");
    ifExpr.elseBlock.expressions.push(
             gvr.lang.newExpression(7, function(){ log.push("else"); }, this));
    // testing else catch
    expect(ifExpr.elseBlock.currentStep).toBe(0);
    next = ifExpr.step();
    expect(log.length).toBe(4);
    expect(log[3],"else");
  });

});
