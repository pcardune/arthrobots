
var Class = require('./Class');

var gvr = {lang:{}};

gvr.lang.RUNNER_GLOBAL_KEY = "$runner";

/**
 * @function
 */
gvr.lang.getRunner = function getRunner(globals){
  globals = globals || {};
  var runner = globals[gvr.lang.RUNNER_GLOBAL_KEY];
  if (!runner){
    /**
     * stubbed out version of {@link gvr.runner.Runner}
     */
    runner = {
      /**
       * @see gvr.runner.Runner#notify
       */
      notify:function(){}
    };
  }
  return runner;
};

gvr.lang.BaseExpression = Class.extend(
  /** @lends gvr.lang.BaseExpression# */
  {
    /**
     * the line number associated with this expression.
     */
    line: null,
    /**
     * the name of this expression. (mostly for debugging)
     */
    name: null,

    /**
     * @class base class used by all other language elements.
     * @constructs
     * @param line the line number associated with this expression.
     * @param name the name of this expression. (mostly for debugging)
     */
    init: function(line, name){
      this.line = line;
      this.name = name;
    }
  }
);

gvr.lang.Expression = gvr.lang.BaseExpression.extend(
  /** @lends gvr.lang.Expression# */
  {

    /**
     * A callable that executes this expression.
     */
    callable: null,
    /**
     * The scope with which to call the callable.
     */
    scope: null,

    /**
     * @class Represents a single expression in the gvr language.
     * @extends gvr.lang.BaseExpression
     * @constructs
     * @param line See {@link gvr.lang.BaseExpression#line}
     * @param callable The callable function that constitutes execution of this expression.
     * @param scope The scope with which to call the callable function.
     */
    init: function(line, callable, scope){
      this._super(line, "expr");
      this.callable = callable;
      this.scope = scope;
    },
    /**
     * Step over this expression.
     * @param globals global values passed throughout program execution.
     */
    step: function(globals){
      gvr.lang.getRunner(globals).notify(this);
      this.callable.call(this.scope);
      return [];
    }
  });

/**
 * Creates a new Expression object.
 * @see gvr.lang.Expression
 * @returns {gvr.lang.Expression}
 */
gvr.lang.newExpression = function(line, callable, scope){
  return new gvr.lang.Expression(line, callable, scope);
};


gvr.lang.Block = Class.extend(
  /** @lends gvr.lang.Block# */
  {
    /**
     * @class Represents an executable grouping of {@link gvr.lang.BaseExpression} objects.
     * @constructs
     * @param expressions A list of {@link gvr.lang.BaseExpression} objects to step over.
     */
    init: function(expressions){
      this.name="block";
      /**
       * A list of expressions that are part of the block
       */
      this.expressions = expressions;
      /**
       * the current step in the block
       */
      this.currentStep = 0;
    },

    /**
     * Step over the next expression in the block.  Once all expressions
     * in the block have been stepped over, the currentStep counter is
     * reset to 0 so the same block instance may be steped over again
     * (for example, when the block is part of a loop).
     * @param globals global values passed throughout program execution.
     */
    step: function(globals){
      var stack = [];
      if (this.currentStep < this.expressions.length){
        stack.push(this);
        var next = this.expressions[this.currentStep].step(globals);
        this.currentStep++;
        stack = stack.concat(next);
      } else {
        this.currentStep = 0;
      }
      return stack;
    }
  });

gvr.lang.If = gvr.lang.BaseExpression.extend(
  /** @lends gvr.lang.If# */
  {
    /**
     * @class Represents an if statement in the gvr language.
     * @extends gvr.lang.BaseExpression
     * @constructs
     * @param line See {@link gvr.lang.BaseExpression#line}
     * @param callable See {@link gvr.lang.If#callable}
     * @param scope See {@link gvr.lang.If#scope}
     * @param expressions A list of expressions with which to
     *          create a {@link gvr.lang.Block} object
     */
    init: function (line, callable, scope, expressions){
      this._super(line, "if");

      /**
       * The callable that returns a boolean value
       * @type {function()}
       */
      this.callable = callable;

      /**
       * The scope with which to call the callable
       * @type {Object}
       */
      this.scope = scope;

      /**
       * The block to step into if the callable returns true
       * @type {gvr.lang.Block}
       */
      this.block = new gvr.lang.Block(expressions);

      /**
       * A list of other elif conditions to try.
       * @type {Array}
       */
      this.elifs = [];

      /**
       * The block to step into if the callable returns false.
       * @type {gvr.lang.Block}
       */
      this.elseBlock = new gvr.lang.Block([]);
    },

    /**
     * Step into the appropriate block depending
     * on the return value of {@link gvr.lang.If#callable}.
     * If there {@link gvr.lang.If#elifs} is not empty, and
     * {@link gvr.lang.If#callable} returns false, then all the elifs
     * will be processed.
     * @param globals global values passed throughout program execution.
     */
    step:function (globals){
      gvr.lang.getRunner(globals).notify(this);
      var conditionMatched = false;
      var stack = [];
      if (this.callable.call(this.scope)){
        stack = this.block.step(globals);
        conditionMatched = true;
      } else if (this.elifs.length > 0){
        for (var i=0; i < this.elifs.length; i++){
          var stackLength = stack.length;
          stack = this.elifs[i].step(globals);
          if (stackLength != stack.length){
            //Stack was changed so we shouldn't fall through anymore.
            conditionMatched = true;
            break;
          }
        }
      }
      if (!conditionMatched && this.elseBlock.expressions.length > 0){
        stack = this.elseBlock.step(globals);
      }
      return stack;
    }
  });

/**
 * creates a new {@link gvr.lang.If} object
 * @returns {gvr.lang.If}
 */
gvr.lang.newIf = function (line, callable, scope, expressions){
  return new gvr.lang.If(line, callable, scope, expressions);
};


gvr.lang.While = gvr.lang.BaseExpression.extend(
  /** @lends gvr.lang.While# */
  {
    /**
     * @class Represents a while loop in the gvr language.
     * @extends gvr.lang.BaseExpression
     * @constructs
     * @param line See {@link gvr.lang.BaseExpression#line}
     * @param callable See {@link gvr.lang.If#callable}
     * @param scope See {@link gvr.lang.If#scope}
     * @param expressions A list of expressions with which to
     *          create a {@link gvr.lang.Block} object
     */
    init: function(line, callable, scope, expressions){
      this._super(line, "while");
      /** A callable that returns a boolean value. */
      this.callable = callable;
      /** the scope with which to call the callable */
      this.scope = scope;
      /** The block to step into as long as the callable returns true */
      this.block = new gvr.lang.Block(expressions);
    },

    /**
     * Step into the while loop's block
     * as long as {@link gvr.lang.While#callable} returns true
     * @param globals global values passed throughout program execution.
     */
    step: function(globals){
      gvr.lang.getRunner(globals).notify(this);
      var stack = [];
      if (this.callable.call(this.scope)){
        stack.push(this);
        stack = stack.concat(this.block.step(globals));
      }
      return stack;
    }
  });

/**
 * creates a new {@link gvr.lang.While} object
 * @returns {gvr.lang.While}
 */
gvr.lang.newWhile = function(line, callable, scope, expressions){
  return new gvr.lang.While(line, callable, scope, expressions);
};

gvr.lang.Do = gvr.lang.BaseExpression.extend(
  /** @lends gvr.lang.Do# */
  {
    /**
     * @class Represents a do loop in the gvr language.
     * @extends gvr.lang.BaseExpression
     * @constructs
     * @param line See {@link gvr.lang.BaseExpression#line}
     * @param count See {@link gvr.lang.Do#count}
     * @param expressions A list of expressions with which to
     *          create a {@link gvr.lang.Block} object
     */
    init: function(line, count, expressions){
      this._super(line, "do");

      /**
       * The number of times to step into the block
       * @type int
       */
      this.count = count;

      /**
       * The block to step into after each successive step
       * @type gvr.lang.Block
       */
      this.block = new gvr.lang.Block(expressions);

      /**
       * The current step of the Do expression
       * @type int
       */
      this.currentStep = 0;
    },

    /**
     * Step into the do loop's block
     * up to the number of times specified by {@link gvr.lang.Do#count}.
     * Once the block has been entered this many times, the counter is
     * reset so the process may occur again (for nested loops).
     * @param globals global values passed throughout program execution.
     */
    step:function(globals){
      gvr.lang.getRunner(globals).notify(this);
      var stack = [];
      if (this.currentStep < this.count){
        stack.push(this);
        this.currentStep++;
        stack = stack.concat(this.block.step(globals));
      } else {
        this.currentStep = 0;
      }
      return stack;
    }
  });

/**
 * creates a new {@link gvr.lang.Do} object
 * @returns {gvr.lang.Do}
 */
gvr.lang.newDo = function(line, count, expressions){
  return new gvr.lang.Do(line, count, expressions);
};



gvr.lang.Define = gvr.lang.BaseExpression.extend(
  /** @lends gvr.lang.Define# */
  {
    /**
     * @class Represents a function definition in the gvr language.
     * @extends gvr.lang.BaseExpression
     * @constructs
     * @param name The name of the function.  Should be unique for each definition.
     *       Used by FunctionCall to look up the function.
     * @param line See {@link gvr.lang.BaseExpression#line}
     * @param expressions A list of expressions with which to
     *          create a {@link gvr.lang.Block} object
     */
    init: function(line, name, expressions){
      this._super(line, name);
      /**
       * The block to step into when this definition is called.
       * @type gvr.lang.Block
       */
      this.block = new gvr.lang.Block(expressions);
    },

    /**
     * Registers the function into the global namespace so it can be accessed
     * by other language objects.
     * @param globals global values passed throughout program execution.
     */
    step:function(globals){
      gvr.lang.getRunner(globals).notify(this);
      globals[this.name] = this;
      return [];
    }
  }
);

/**
 * creates a new {@link gvr.lang.Define} object
 * @returns {gvr.lang.Define}
 */
gvr.lang.newDefine = function(line, name, expressions){
  return new gvr.lang.Define(line, name, expressions);
};

gvr.lang.FunctionCall = gvr.lang.BaseExpression.extend(
  /** @lends gvr.lang.FunctionCall# */
  {
    /**
     * @class Represents a functionc all in the gvr language.
     * @extends gvr.lang.BaseExpression
     * @constructs
     * @param line See {@link gvr.lang.BaseExpression#line}
     * @param fname See {@link gvr.lang.FunctionCall#fname}
     */
    init: function(line, fname){
      this._super(line, "call");
      /**
       * The name of the function to call
       * @type String
       */
      this.fname = fname;
    },
    /**
     * Steps into the block of the function stored in globals
     * under the name specified by {@link gvr.lang.FunctionCall#fname}.
     * @param globals global values passed throughout program execution.
     */
    step: function(globals){
      gvr.lang.getRunner(globals).notify(this);
      if (!globals[this.fname]){
        throw new Error("The function "+this.fname+" is undefined.");
      }
      return globals[this.fname].block.step(globals);
    }
  });

/**
 * creates a new {@link gvr.lang.FunctionCall} object
 * @returns {gvr.lang.FunctionCall}
 */
gvr.lang.newFunctionCall = function(line, fname){
  return new gvr.lang.FunctionCall(line, fname);
};

module.exports = gvr.lang;