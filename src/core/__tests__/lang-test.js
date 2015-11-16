/*global jest describe it expect xit*/
jest.dontMock('../Class')
jest.dontMock('../lang')

var lang = require('../lang')

describe('lang Expression', function() {

  let from = {line: 0, ch: 0}
  let to = {line: 0, ch: 1}

  /**
   * The most atomic part of a code execution path is an
   * expression. An expression simply calls a passed in function with a
   * given scope and returns an empty stack (i.e. there is nothing left
   * to do.)
   */
  it('should call the associated function and return an empty stack',
    function() {
      var calledWith
      var scope = {a: 1}
      function func(){
        calledWith = this
      }
      var expression = new lang.Expression(from, to, func, scope)
      var next = expression.step({}, {})
      expect(calledWith).toBe(scope)
      expect(next.length).toBe(0)
    })

  /**
   * The next level up after expressions are blocks. These are
   * essentially just a grouping of expression objects.
   */
  it('should work with blocks', function(){
    var log = []
    var block = new lang.Block([
      new lang.Expression(from, to, function(){ log.push(1) }, this)
    ])
    // step over the block once, it will finish
    var next = block.step({}, {})
    expect(log[0]).toBe(1)
    expect(next.length).toBe(1)
    // if the block is finished, and we step onto it, it will reset.
    next = next[0].instruction.step({}, next[0].context)
    expect(log[0]).toBe(1)
    expect(log.length).toBe(1)
    expect(next.length).toBe(0)
    // now it goes back to the beginning.
    next = block.step({}, {})
    expect(log[1]).toBe(1)
    expect(next.length).toBe(1)
  })

  it("should work with blocks that have multiple expressions", function() {
    var log = []
    var block = new lang.Block(
      [
        new lang.Expression(from, to, function(){ log.push("one") }, this),
        new lang.Expression(from, to, function(){ log.push("two") }, this),
        new lang.Expression(from, to, function(){ log.push("three") }, this)
      ])
    // execute the first step
    var next = block.step({}, {})
    expect(log[0]).toBe("one")
    expect(next.length).toBe(1)
    expect(next[0].context.currentStep).toBe(1)
    expect(next[0].instruction).toBe(block)
    // execute the second step
    next = block.step({}, next[0].context)
    expect(log[1]).toBe("two")
    expect(next.length).toBe(1)
    expect(next[0].context.currentStep).toBe(2)
    expect(next[0].instruction).toBe(block)
    // execute the third step
    next = block.step({}, next[0].context)
    expect(log[2]).toBe("three")
    expect(next.length).toBe(1)
    // the next time we step on the block, it resets.
    next = block.step({}, next[0].context)
    expect(log.length).toBe(3)
    expect(next.length).toBe(0)
  })

  it("should work with if statements", function(){
    var log = []
    var nextCond = true
    function condition(){
      return nextCond
    }
    var ifExpr = new lang.If(from, to, condition, {},
      [new lang.Expression(from, to, function(){ log.push("one") }, this)]
    )
    var next = ifExpr.step({}, {})
    expect(next.length).toBe(1)
    expect(log.length).toBe(1)
    expect(log[0],"one")
    next[0].instruction.step({}, next[0].context)
    next = ifExpr.step({}, {})
    expect(log.length).toBe(2)
    next[0].instruction.step({}, next[0].context)
    nextCond = false
    next = ifExpr.step({}, next[0].context)
    expect(log.length).toBe(2)
  })

  it("should work with else statements", function() {
    var log = []
    var nextCond = true
    function condition(){
      return nextCond
    }
    var ifExpr = new lang.If(from, to, condition, {}, [
      new lang.Expression(from, to, function(){ log.push("one") }, this)])
    ifExpr.elseBlock.expressions.push(
      new lang.Expression(from, to, function(){ log.push("two") }, this))
    var next = ifExpr.step({}, {})
    expect(next.length).toBe(1)
    expect(log.length).toBe(1)
    expect(log[0],"one")
    next[0].instruction.step({}, next[0].context)
    nextCond = false
    next = ifExpr.step({}, {})
    expect(log.length).toBe(2)
    expect(log[1],"two")
    expect(next.length).toBe(1)
    next[0].instruction.step({}, {})
  })

  it('should work with elif statements', function() {
    var a = true
    var b = true
    var c = true
    var aExpr = jest.genMockFunction()
    var bExpr = jest.genMockFunction()
    var cExpr = jest.genMockFunction()
    var ifExpr = new lang.If(from, to, function(){return a}, {}, [
      new lang.Expression(from, to, aExpr, this)])
    ifExpr.elifs.push(
      new lang.If(from, to, function(){return b}, {}, [
        new lang.Expression(from, to, bExpr, this)]))
    ifExpr.elifs.push(
      new lang.If(from, to, function(){return c}, {}, [
        new lang.Expression(from, to, cExpr, this)]))
    // testing if catch
    var next = ifExpr.step({}, {})
    expect(next.length).toBe(1)
    expect(aExpr.mock.calls.length).toBe(1)
    expect(bExpr.mock.calls.length).toBe(0)
    expect(cExpr.mock.calls.length).toBe(0)
    next[0].instruction.step({}, next[0].context)
    // testing first elif catch
    a = false
    next = ifExpr.step({}, {})
    expect(aExpr.mock.calls.length).toBe(1)
    expect(bExpr.mock.calls.length).toBe(1)
    expect(cExpr.mock.calls.length).toBe(0)
    // testing second elif catch
    b = false
    next = ifExpr.step({}, {})
    expect(aExpr.mock.calls.length).toBe(1)
    expect(bExpr.mock.calls.length).toBe(1)
    expect(cExpr.mock.calls.length).toBe(1)
    c = false
    next = ifExpr.step({}, {})
    expect(aExpr.mock.calls.length).toBe(1)
    expect(bExpr.mock.calls.length).toBe(1)
    expect(cExpr.mock.calls.length).toBe(1)
    var elseExpr = jest.genMockFunction()
    ifExpr.elseBlock.expressions.push(
      new lang.Expression(from, to, elseExpr, this))
    // testing else catch
    next = ifExpr.step({}, {})
    expect(aExpr.mock.calls.length).toBe(1)
    expect(bExpr.mock.calls.length).toBe(1)
    expect(cExpr.mock.calls.length).toBe(1)
    expect(elseExpr.mock.calls.length).toBe(1)
  })

  it('should work with while statements', function() {
    var whileIsTrue = true
    var expr = jest.genMockFunction()
    var whileExpr = new lang.While(from, to, function(){return whileIsTrue}, {}, [
      new lang.Expression(from, to, expr, this)])

    var next = whileExpr.step({}, {})
    expect(next.length).toBe(2)
    expect(expr.mock.calls.length).toBe(1)

    next[0].instruction.step({}, next[0].context)
    expect(next.length).toBe(2)
    expect(expr.mock.calls.length).toBe(2)

    whileIsTrue = false
    next[0].instruction.step({}, next[0].context)
    expect(next.length).toBe(2)
    expect(expr.mock.calls.length).toBe(2)
  })

  it('should work with do statements', function() {
    var expr = jest.genMockFunction()
    var doExpr = new lang.Do(from, to, 3, [
      new lang.Expression(from, to, expr, this)])

    var next = doExpr.step({}, {})
    expect(next.length).toBe(2)
    expect(next[0].instruction).toBe(doExpr)
    expect(next[1].instruction).toBe(doExpr.block)
    expect(next[0].context.currentStep).toBe(1)
    expect(expr.mock.calls.length).toBe(1)

    next = next[0].instruction.step({}, next[0].context)
    expect(next[0].context.currentStep).toBe(2)
    expect(expr.mock.calls.length).toBe(2)

    next = next[0].instruction.step({}, next[0].context)
    expect(next[0].context.currentStep).toBe(3)
    expect(expr.mock.calls.length).toBe(3)

    next = next[0].instruction.step({}, next[0].context)
    expect(next.length).toBe(0)
    expect(expr.mock.calls.length).toBe(3)
  })

  it('should work with define statements', function() {
    var defineExpr = new lang.Define(from, to, 'foo', [
      new lang.Expression(from, to, jest.genMockFunction(), this)])

    var globals = {}
    var next = defineExpr.step(globals, {})
    expect(globals.foo).toBe(defineExpr)
    expect(next.length).toBe(0)
  })

  it('should work with function calls', function() {
    var globals = {}
    var functionCallExpr = new lang.FunctionCall(from, to, 'foo')
    try {
      functionCallExpr.step(globals, {})
    } catch (e) {
      expect(e.message).toBe('The function foo is undefined.')
    }

    var expr = jest.genMockFunction()
    globals.foo = new lang.Define(from, to, 'foo', [
      new lang.Expression(from, to, expr, this)])
    functionCallExpr.step(globals, {})
    expect(expr.mock.calls.length).toBe(1)
  })

})
