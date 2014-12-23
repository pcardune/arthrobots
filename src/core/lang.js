
var Class = require('./Class');

var lang = {};
lang.RUNNER_GLOBAL_KEY = "$runner";

/**
 * @function
 */
lang.getRunner = function getRunner(globals){
  globals = globals || {};
  var runner = globals[lang.RUNNER_GLOBAL_KEY];
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

lang.BaseExpression = Class.extend(
  /** @lends lang.BaseExpression# */
  {
    /**
     * the line number associated with this expression.
     */
    line: null,
    /**
     * The line that was last executed. Useful for expressions
     * with complex execution patterns
     */
    lastExecutedLine: null,
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
      this.line = this.lastExecutedLine = line;
      this.name = name;
    }
  }
);

lang.Expression = lang.BaseExpression.extend(
  /** @lends lang.Expression# */
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
     * @extends lang.BaseExpression
     * @constructs
     * @param line See {@link lang.BaseExpression#line}
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
    step: function(globals, context){
      lang.getRunner(globals).notify(this);
      this.callable.call(this.scope);
      return [];
    }
  });

/**
 * Creates a new Expression object.
 * @see lang.Expression
 * @returns {lang.Expression}
 */
lang.newExpression = function(line, callable, scope){
  return new lang.Expression(line, callable, scope);
};


lang.Block = Class.extend(
  /** @lends lang.Block# */
  {
    /**
     * @class Represents an executable grouping of {@link lang.BaseExpression} objects.
     * @constructs
     * @param expressions A list of {@link lang.BaseExpression} objects to step over.
     */
    init: function(expressions){
      this.name="block";
      /**
       * A list of expressions that are part of the block
       */
      this.expressions = expressions;
    },

    /**
     * Step over the next expression in the block.  Once all expressions
     * in the block have been stepped over, the currentStep counter is
     * reset to 0 so the same block instance may be steped over again
     * (for example, when the block is part of a loop).
     * @param globals global values passed throughout program execution.
     */
    step: function(globals, context){
      var stack = [];
      var currentStep = context.currentStep || 0;
      if (currentStep < this.expressions.length){
        var next = this.expressions[currentStep].step(globals, {});
        this.lastExecutedLine = this.expressions[currentStep].lastExecutedLine;
        currentStep++;
        stack.push({instruction: this, context:{currentStep:currentStep}});
        stack = stack.concat(next);
      } else {
        currentStep = 0;
        this.lastExecutedLine = this.expressions[currentStep].lastExecutedLine;
      }
      return stack;
    }
  });

lang.If = lang.BaseExpression.extend(
  /** @lends lang.If# */
  {
    /**
     * @class Represents an if statement in the gvr language.
     * @extends lang.BaseExpression
     * @constructs
     * @param line See {@link lang.BaseExpression#line}
     * @param callable See {@link lang.If#callable}
     * @param scope See {@link lang.If#scope}
     * @param expressions A list of expressions with which to
     *          create a {@link lang.Block} object
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
       * @type {lang.Block}
       */
      this.block = new lang.Block(expressions);

      /**
       * A list of other elif conditions to try.
       * @type {Array}
       */
      this.elifs = [];

      /**
       * The block to step into if the callable returns false.
       * @type {lang.Block}
       */
      this.elseBlock = new lang.Block([]);
    },

    /**
     * Step into the appropriate block depending
     * on the return value of {@link lang.If#callable}.
     * If there {@link lang.If#elifs} is not empty, and
     * {@link lang.If#callable} returns false, then all the elifs
     * will be processed.
     * @param globals global values passed throughout program execution.
     */
    step: function(globals, context){
      lang.getRunner(globals).notify(this);
      var conditionMatched = false;
      var stack = [];
      if (this.callable.call(this.scope)){
        stack = this.block.step(globals, {});
        this.lastExecutedLine = this.block.lastExecutedLine;
        conditionMatched = true;
      } else if (this.elifs.length > 0){
        for (var i=0; i < this.elifs.length; i++){
          var stackLength = stack.length;
          stack = this.elifs[i].step(globals, {});
          this.lastExecutedLine = this.elifs[i].lastExecutedLine;
          if (stackLength != stack.length){
            //Stack was changed so we shouldn't fall through anymore.
            conditionMatched = true;
            break;
          }
        }
      }
      if (!conditionMatched && this.elseBlock.expressions.length > 0){
        stack = this.elseBlock.step(globals, {});
        this.lastExecutedLine = this.elseBlock.lastExecutedLine;
      }
      return stack;
    }
  });

/**
 * creates a new {@link lang.If} object
 * @returns {lang.If}
 */
lang.newIf = function (line, callable, scope, expressions){
  return new lang.If(line, callable, scope, expressions);
};


lang.While = lang.BaseExpression.extend(
  /** @lends lang.While# */
  {
    /**
     * @class Represents a while loop in the gvr language.
     * @extends lang.BaseExpression
     * @constructs
     * @param line See {@link lang.BaseExpression#line}
     * @param callable See {@link lang.If#callable}
     * @param scope See {@link lang.If#scope}
     * @param expressions A list of expressions with which to
     *          create a {@link lang.Block} object
     */
    init: function(line, callable, scope, expressions){
      this._super(line, "while");
      /** A callable that returns a boolean value. */
      this.callable = callable;
      /** the scope with which to call the callable */
      this.scope = scope;
      /** The block to step into as long as the callable returns true */
      this.block = new lang.Block(expressions);
    },

    /**
     * Step into the while loop's block
     * as long as {@link lang.While#callable} returns true
     * @param globals global values passed throughout program execution.
     */
    step: function(globals, context){
      lang.getRunner(globals).notify(this);
      var stack = [];
      if (this.callable.call(this.scope)){
        stack.push({instruction: this, context:{}});
        stack = stack.concat(this.block.step(globals, {}));
        this.lastExecutedLine = this.block.lastExecutedLine;
      }
      return stack;
    }
  });

/**
 * creates a new {@link lang.While} object
 * @returns {lang.While}
 */
lang.newWhile = function(line, callable, scope, expressions){
  return new lang.While(line, callable, scope, expressions);
};

lang.Do = lang.BaseExpression.extend(
  /** @lends lang.Do# */
  {
    /**
     * @class Represents a do loop in the gvr language.
     * @extends lang.BaseExpression
     * @constructs
     * @param line See {@link lang.BaseExpression#line}
     * @param count See {@link lang.Do#count}
     * @param expressions A list of expressions with which to
     *          create a {@link lang.Block} object
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
       * @type lang.Block
       */
      this.block = new lang.Block(expressions);
    },

    /**
     * Step into the do loop's block
     * up to the number of times specified by {@link lang.Do#count}.
     * Once the block has been entered this many times, the counter is
     * reset so the process may occur again (for nested loops).
     * @param globals global values passed throughout program execution.
     */
    step: function(globals, context){
      lang.getRunner(globals).notify(this);
      var stack = [];
      var currentStep = context.currentStep || 0;
      if (currentStep < this.count){
        currentStep++;
        stack.push({instruction:this, context:{currentStep:currentStep}});
        stack = stack.concat(this.block.step(globals, {}));
        this.lastExecutedLine = this.block.lastExecutedLine;
      }
      return stack;
    }
  });

/**
 * creates a new {@link lang.Do} object
 * @returns {lang.Do}
 */
lang.newDo = function(line, count, expressions){
  return new lang.Do(line, count, expressions);
};



lang.Define = lang.BaseExpression.extend(
  /** @lends lang.Define# */
  {
    /**
     * @class Represents a function definition in the gvr language.
     * @extends lang.BaseExpression
     * @constructs
     * @param name The name of the function.  Should be unique for each definition.
     *       Used by FunctionCall to look up the function.
     * @param line See {@link lang.BaseExpression#line}
     * @param expressions A list of expressions with which to
     *          create a {@link lang.Block} object
     */
    init: function(line, name, expressions){
      this._super(line, name);
      /**
       * The block to step into when this definition is called.
       * @type lang.Block
       */
      this.block = new lang.Block(expressions);
    },

    /**
     * Registers the function into the global namespace so it can be accessed
     * by other language objects.
     * @param globals global values passed throughout program execution.
     */
    step: function(globals, context){
      lang.getRunner(globals).notify(this);
      globals[this.name] = this;
      return [];
    }
  }
);

/**
 * creates a new {@link lang.Define} object
 * @returns {lang.Define}
 */
lang.newDefine = function(line, name, expressions){
  return new lang.Define(line, name, expressions);
};

lang.FunctionCall = lang.BaseExpression.extend(
  /** @lends lang.FunctionCall# */
  {
    /**
     * @class Represents a functionc all in the gvr language.
     * @extends lang.BaseExpression
     * @constructs
     * @param line See {@link lang.BaseExpression#line}
     * @param fname See {@link lang.FunctionCall#fname}
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
     * under the name specified by {@link lang.FunctionCall#fname}.
     * @param globals global values passed throughout program execution.
     */
    step: function(globals, context){
      lang.getRunner(globals).notify(this);
      if (!globals[this.fname]){
        throw new Error("The function "+this.fname+" is undefined.");
      }
      return globals[this.fname].block.step(globals, context);
    }
  });

/**
 * creates a new {@link lang.FunctionCall} object
 * @returns {lang.FunctionCall}
 */
lang.newFunctionCall = function(line, fname){
  return new lang.FunctionCall(line, fname);
};

module.exports = lang;