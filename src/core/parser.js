/**
 * @name parser
 * @namespace parser module for generating the parse tree.
 */
var debug = function(){};
var lang = require('./lang');
var parser = {};

var Class = require('./Class');

/**
 * regex for an expression.
 * @constant
 */
parser.EXPRESSION = /^(\w*)\s*$/;
/**
 * regex for a do line.
 * @constant
 */
parser.DO = /^do\s*(\d+)\s*:\s*$/;
/**
 * regex for an if line
 * @constant
 */
parser.IF = /^if\s*(\w+)\s*:\s*$/;
/**
 * regex for an elif line
 * @constant
 */
parser.ELIF = /^elif\s*(\w+)\s*:\s*$/;
/**
 * reges for an else line
 * @constant
 */
parser.ELSE = /^else\s*:\s*$/;
/**
 * regex for a while line.
 * @constant
 */
parser.WHILE = /^while\s*(\w+)\s*:\s*$/;
/**
 * regex for a function definition line.
 * @constant
 */
parser.DEFINE = /^define\s*(\w+)\s*:\s*$/;
/**
 * regex for an empty line
 * @constant
 */
parser.EMPTY_LINE = /^\s*$/;
/**
 * regex for the indentation of a line.
 * @constant
 */
parser.INDENTATION = /^(\s*).*$/;


/**
 * removes a comment from a line. Comments start with #.
 * @param line The line form which to remove a comment.
 */
parser.removeComment = function(line){
  var commentStart = line.indexOf('#');
  if (commentStart >= 0){
    line = line.slice(0, commentStart);
  }
  return line;
};


parser.Parser = Class.extend(
  /** @lends parser.Parser */
  {
    /**
     * @class A parser for the gvr language.
     * @constructs
     * @param lines See {@link parser.Parser#lines}
     * @param robot See {@link parser.Parser#robot}
     */
    init: function(lines, robot){
      /**
       * The lines that should be parsed.
       * @type Array
       */
      this.lines = lines;

      /**
       * The robot to use when constructing expressions.
       * The expressions will reference functions scoped
       * to the robot.
       * @type gvr.robot.Robot
       */
      this.robot = robot;

      /**
       * The line index that the parser is currently parsing.
       * @type int
       */
      this.lineIndex = 0;
    },

    /**
     * Parse the lines defined by {@link parser.Parser#lines}
     * @returns lang.Block
     */
    parse: function (){
      return new lang.Block(this.parseLines(""));
    },

    isJS: function() {
      for (var i = 0; i < this.lines.length; i++) {
        if (this.lines[i].indexOf('(') > 0) {
          return true;
        }
      }
      return false;
    },

    wrapJSForEval: function() {
      var js = "(function(";
      for (var key in this.robot) {
        if (typeof this.robot[key] == "function") {
          js += key+',';
        }
      }
      // remove trailing , from argument list
      js = js.slice(0, js.length - 1);

      js += "){\n";
      for (var i = 0; i < this.lines.length; i++) {
        js += this.lines[i]+"\n";
      }
      js += "})("
      for (var key in this.robot) {
        if (typeof this.robot[key] == "function") {
          js += 'robot.'+key+',';
        }
      }
      // remove trailing , again
      js = js.slice(0, js.length - 1)
      js += ")";
      return js;
    },

    /**
     * @private
     */
    handlers: [
      function parseExpression(line, indent, expressions){
        var expressionMatch = line.match(parser.EXPRESSION);
        if (expressionMatch){
          var expr = expressionMatch[1];
          debug(indent+expr);
          if (expr in this.robot){
            expressions.push(lang.newExpression(this.lineIndex, this.robot[expr], this.robot));
          } else {
            expressions.push(lang.newFunctionCall(this.lineIndex, expr));
          }
          return true;
        }
        return false;
      },

      function parseDo(line, indent, expressions){
        var doMatch = line.match(parser.DO);
        if (doMatch){
          var count = parseInt(doMatch[1],10);
          debug(indent+'do '+count+':');
          expressions.push(lang.newDo(this.lineIndex, count, this.parseBlock()));
          return true;
        }
        return false;
      },

      function parseIf(line, indent, expressions){
        var ifMatch = line.match(parser.IF);
        if (ifMatch){
          var cond = ifMatch[1];
          if (cond in this.robot){
            debug(indent+'if '+cond+':');
            expressions.push(lang.newIf(this.lineIndex, this.robot[cond], this.robot, this.parseBlock()));
            return true;
          }
        }
        return false;
      },

      function parseElif(line, indent, expressions){
        var elifMatch = line.match(parser.ELIF);
        if (elifMatch && expressions[expressions.length-1].name === 'if'){
          var cond = elifMatch[1];
          debug(indent+'elif '+cond+':');
          expressions[expressions.length-1].elifs.push(
            lang.newIf(this.lineIndex, this.robot[cond], this.robot, this.parseBlock()));
          return true;
        }
        return false;
      },

      function parseElse(line, indent, expressions){
        var elseMatch = line.match(parser.ELSE);
        if (elseMatch && expressions[expressions.length-1].name === 'if'){
          debug(indent+'else:');
          expressions[expressions.length-1].elseBlock.expressions = this.parseBlock();
          return true;
        }
        return false;
      },

      function parseWhile(line, indent, expressions){
        var whileMatch = line.match(parser.WHILE);
        if (whileMatch){
          cond = whileMatch[1];
          if (cond in this.robot){
            debug(indent+'while '+cond+':');
            expressions.push(lang.newWhile(this.lineIndex, this.robot[cond], this.robot, this.parseBlock()));
            return true;
          }
        }
        return false;
      },

      function parseDefine(line, indent, expressions){
        var defineMatch = line.match(parser.DEFINE);
        if (defineMatch){
          var name = defineMatch[1];
          debug(indent+'define '+name+':');
          expressions.push(lang.newDefine(this.lineIndex, name, this.parseBlock()));
          return true;
        }
        return false;
      }
    ],

    /**
     * @private
     */
    parseLines: function (indent){
      var expressions = [];
      for (; this.lineIndex < this.lines.length; this.lineIndex++){
        var line = parser.removeComment(this.lines[this.lineIndex]);
        if (line.indexOf(indent) !== 0){
          break;
        } else {
          line = line.slice(indent.length);
        }
        if (line.match(parser.EMPTY_LINE)){
          continue;
        }
        var done = false;
        for (var i=0; i < this.handlers.length; i++){
          var handler = this.handlers[i];
          if (handler.call(this, line, indent, expressions)){
            done = true;
            break;
          }
        }
        if (!done){
          throw new Error("Syntax Error on line "+(this.lineIndex+1)+": "+line);
        }
      }
      return expressions;
    },

    /**
     * @private
     */
    parseBlock: function(){
      var nextLine = this.lines[++this.lineIndex];
      var indentation = nextLine.match(parser.INDENTATION)[1];
      var subExpressions = this.parseLines(indentation);
      this.lineIndex--;
      return subExpressions;
    }

  });


/**
 * Create a new {@link parser.Parser} object
 * @param lines See {@link parser.Parser#lines}
 * @param robot See {@link parser.Parser#robot}
 * @returns parser.Parser
 */
parser.newParser = function(lines, robot){
  return new parser.Parser(lines, robot);
};

module.exports = parser;