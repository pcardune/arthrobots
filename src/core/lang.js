
const RUNNER_GLOBAL_KEY = Symbol("$runner")

/**
 * @function
 */
export const getRunner = function(globals){
  globals = globals || {}
  var runner = globals[RUNNER_GLOBAL_KEY]
  if (!runner){
    /**
     * stubbed out version of {@link gvr.runner.Runner}
     */
    runner = {
      /**
       * @see gvr.runner.Runner#notify
       */
      notify:function(){}
    }
  }
  return runner
}

class BaseExpression {
  /**
   * @class base class used by all other language elements.
   * @constructs
   * @param line the line number associated with this expression.
   * @param name the name of this expression. (mostly for debugging)
   */
  constructor(from, to, name){
    /**
     * the line number associated with this expression.
     */
    this.from = from
    this.to = to
    this.lastExecutedLine = from.line
    /**
     * the name of this expression. (mostly for debugging)
     */
    this.name = name
  }

  get line() {
    return this.from.line
  }
}


export class Expression extends BaseExpression {
  /**
   * @class Represents a single expression in the gvr language.
   * @extends BaseExpression
   * @constructs
   * @param line See {@link BaseExpression#line}
   * @param callable The callable function that constitutes execution of this expression.
   * @param scope The scope with which to call the callable function.
   */
  constructor(from, to, callable, scope){
    super(from, to, "expr")
    /**
     * A callable that executes this expression.
     */
    this.callable = callable
    /**
     * The scope with which to call the callable.
     */
    this.scope = scope
  }
  /**
   * Step over this expression.
   * @param globals global values passed throughout program execution.
   */
  step(globals, context){
    getRunner(globals).notify(this)
    this.callable.call(this.scope)
    return []
  }
}


export class Block {
  /**
   * @class Represents an executable grouping of {@link BaseExpression} objects.
   * @constructs
   * @param expressions A list of {@link BaseExpression} objects to step over.
   */
  constructor(expressions){
    this.from = {line: 0, ch: 0}
    this.to = {line: 0, ch: 0}
    this.name = "block"
    /**
     * A list of expressions that are part of the block
     */
    this.expressions = expressions
    if (expressions.length) {
      Object.assign(this.from, expressions[0].from)
      Object.assign(this.to, expressions[expressions.length - 1].to)
    }
  }

  /**
   * Step over the next expression in the block.  Once all expressions
   * in the block have been stepped over, the currentStep counter is
   * reset to 0 so the same block instance may be steped over again
   * (for example, when the block is part of a loop).
   * @param globals global values passed throughout program execution.
   */
  step(globals, context){
    var stack = []
    var currentStep = context.currentStep || 0
    if (currentStep < this.expressions.length){
      var next = this.expressions[currentStep].step(globals, {})
      this.lastExecutedLine = this.expressions[currentStep].lastExecutedLine
      currentStep++
      stack.push({instruction: this, context:{currentStep:currentStep}})
      stack = stack.concat(next)
    } else {
      currentStep = 0
      this.lastExecutedLine = this.expressions[currentStep].lastExecutedLine
    }
    return stack
  }
}

export class If extends BaseExpression {
  /**
   * @class Represents an if statement in the gvr language.
   * @extends BaseExpression
   * @constructs
   * @param line See {@link BaseExpression#line}
   * @param callable See {@link If#callable}
   * @param scope See {@link If#scope}
   * @param expressions A list of expressions with which to
   *          create a {@link Block} object
   */
  constructor(from, to, callable, scope, expressions){
    super(from, to, "if")

    /**
     * The callable that returns a boolean value
     * @type {function()}
     */
    this.callable = callable

    /**
     * The scope with which to call the callable
     * @type {Object}
     */
    this.scope = scope

    /**
     * The block to step into if the callable returns true
     * @type {Block}
     */
    this.block = new Block(expressions)

    /**
     * A list of other elif conditions to try.
     * @type {Array}
     */
    this.elifs = []

    /**
     * The block to step into if the callable returns false.
     * @type {Block}
     */
    this.elseBlock = new Block([])
  }

  /**
   * Step into the appropriate block depending
   * on the return value of {@link If#callable}.
   * If there {@link If#elifs} is not empty, and
   * {@link If#callable} returns false, then all the elifs
   * will be processed.
   * @param globals global values passed throughout program execution.
   */
  step(globals, context){
    getRunner(globals).notify(this)
    var conditionMatched = false
    var stack = []
    if (this.callable.call(this.scope)){
      stack = this.block.step(globals, {})
      this.lastExecutedLine = this.block.lastExecutedLine
      conditionMatched = true
    } else if (this.elifs.length > 0){
      for (var i=0; i < this.elifs.length; i++){
        var stackLength = stack.length
        stack = this.elifs[i].step(globals, {})
        this.lastExecutedLine = this.elifs[i].lastExecutedLine
        if (stackLength != stack.length){
          //Stack was changed so we shouldn't fall through anymore.
          conditionMatched = true
          break
        }
      }
    }
    if (!conditionMatched && this.elseBlock.expressions.length > 0){
      stack = this.elseBlock.step(globals, {})
      this.lastExecutedLine = this.elseBlock.lastExecutedLine
    }
    return stack
  }
}

export class While extends BaseExpression {
    /**
     * @class Represents a while loop in the gvr language.
     * @extends BaseExpression
     * @constructs
     * @param line See {@link BaseExpression#line}
     * @param callable See {@link If#callable}
     * @param scope See {@link If#scope}
     * @param expressions A list of expressions with which to
     *          create a {@link Block} object
     */
    constructor(from, to, callable, scope, expressions){
      super(from, to, "while")
      /** A callable that returns a boolean value. */
      this.callable = callable
      /** the scope with which to call the callable */
      this.scope = scope
      /** The block to step into as long as the callable returns true */
      this.block = new Block(expressions)
    }

    /**
     * Step into the while loop's block
     * as long as {@link While#callable} returns true
     * @param globals global values passed throughout program execution.
     */
    step(globals, context){
      getRunner(globals).notify(this)
      var stack = []
      if (this.callable.call(this.scope)){
        stack.push({instruction: this, context:{}})
        stack = stack.concat(this.block.step(globals, {}))
        this.lastExecutedLine = this.block.lastExecutedLine
      }
      return stack
    }
  }

export class Do extends BaseExpression {
  /**
   * @class Represents a do loop in the gvr language.
   * @extends BaseExpression
   * @constructs
   * @param line See {@link BaseExpression#line}
   * @param count See {@link Do#count}
   * @param expressions A list of expressions with which to
   *          create a {@link Block} object
   */
  constructor(from, to, count, expressions){
    super(from, to, "do")

    /**
     * The number of times to step into the block
     * @type int
     */
    this.count = count

    /**
     * The block to step into after each successive step
     * @type Block
     */
    this.block = new Block(expressions)
  }

  /**
   * Step into the do loop's block
   * up to the number of times specified by {@link Do#count}.
   * Once the block has been entered this many times, the counter is
   * reset so the process may occur again (for nested loops).
   * @param globals global values passed throughout program execution.
   */
  step(globals, context){
    getRunner(globals).notify(this)
    var stack = []
    var currentStep = context.currentStep || 0
    if (currentStep < this.count){
      currentStep++
      stack.push({instruction:this, context:{currentStep:currentStep}})
      stack = stack.concat(this.block.step(globals, {}))
      this.lastExecutedLine = this.block.lastExecutedLine
    }
    return stack
  }
}


export class Define extends BaseExpression {
  /**
   * @class Represents a function definition in the gvr language.
   * @extends BaseExpression
   * @constructs
   * @param name The name of the function.  Should be unique for each definition.
   *       Used by FunctionCall to look up the function.
   * @param line See {@link BaseExpression#line}
   * @param expressions A list of expressions with which to
   *          create a {@link Block} object
   */
  constructor(from, to, name, expressions){
    super(from, to, name)
    /**
     * The block to step into when this definition is called.
     * @type Block
     */
    this.block = new Block(expressions)
  }

  /**
   * Registers the function into the global namespace so it can be accessed
   * by other language objects.
   * @param globals global values passed throughout program execution.
   */
  step(globals, context){
    getRunner(globals).notify(this)
    globals[this.name] = this
    return []
  }
}


export class FunctionCall extends BaseExpression {
  /**
   * @class Represents a functionc all in the gvr language.
   * @extends BaseExpression
   * @constructs
   * @param line See {@link BaseExpression#line}
   * @param fname See {@link FunctionCall#fname}
   */
  constructor(from, to, fname){
    super(from, to, "call")
    /**
     * The name of the function to call
     * @type String
     */
    this.fname = fname
  }
  /**
   * Steps into the block of the function stored in globals
   * under the name specified by {@link FunctionCall#fname}.
   * @param globals global values passed throughout program execution.
   */
  step(globals, context){
    getRunner(globals).notify(this)
    if (!globals[this.fname]){
      throw new Error("The function "+this.fname+" is undefined.")
    }
    return globals[this.fname].block.step(globals, context)
  }
}
