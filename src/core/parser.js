/**
 * @name gvr.lang.parser
 * @namespace parser module for generating the parse tree.
 */
var gvr = {debug: function(){}};
gvr.lang = require('./lang');
gvr.lang.parser = {};

var Class = require('./Class');

/**
 * regex for an expression.
 * @constant
 */
gvr.lang.parser.EXPRESSION = /^(\w*)\s*$/;
/**
 * regex for a do line.
 * @constant
 */
gvr.lang.parser.DO = /^do\s*(\d+)\s*:\s*$/;
/**
 * regex for an if line
 * @constant
 */
gvr.lang.parser.IF = /^if\s*(\w+)\s*:\s*$/;
/**
 * regex for an elif line
 * @constant
 */
gvr.lang.parser.ELIF = /^elif\s*(\w+)\s*:\s*$/;
/**
 * reges for an else line
 * @constant
 */
gvr.lang.parser.ELSE = /^else\s*:\s*$/;
/**
 * regex for a while line.
 * @constant
 */
gvr.lang.parser.WHILE = /^while\s*(\w+)\s*:\s*$/;
/**
 * regex for a function definition line.
 * @constant
 */
gvr.lang.parser.DEFINE = /^define\s*(\w+)\s*:\s*$/;
/**
 * regex for an empty line
 * @constant
 */
gvr.lang.parser.EMPTY_LINE = /^\s*$/;
/**
 * regex for the indentation of a line.
 * @constant
 */
gvr.lang.parser.INDENTATION = /^(\s*).*$/;


/**
 * removes a comment from a line. Comments start with #.
 * @param line The line form which to remove a comment.
 */
gvr.lang.parser.removeComment = function(line){
  var commentStart = line.indexOf('#');
  if (commentStart >= 0){
    line = line.slice(0, commentStart);
  }
  return line;
};


gvr.lang.parser.Parser = Class.extend(
  /** @lends gvr.lang.parser.Parser */
  {
    /**
     * @class A parser for the gvr language.
     * @constructs
     * @param lines See {@link gvr.lang.parser.Parser#lines}
     * @param robot See {@link gvr.lang.parser.Parser#robot}
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
     * Parse the lines defined by {@link gvr.lang.parser.Parser#lines}
     * @returns gvr.lang.Block
     */
    parse: function (){
      return new gvr.lang.Block(this.parseLines(""));
    },

    /**
     * @private
     */
    handlers: [
      function parseExpression(line, indent, expressions){
        var expressionMatch = line.match(gvr.lang.parser.EXPRESSION);
        if (expressionMatch){
          var expr = expressionMatch[1];
          gvr.debug(indent+expr);
          if (expr in this.robot){
            expressions.push(gvr.lang.newExpression(this.lineIndex, this.robot[expr], this.robot));
          } else {
            expressions.push(gvr.lang.newFunctionCall(this.lineIndex, expr));
          }
          return true;
        }
        return false;
      },

      function parseDo(line, indent, expressions){
        var doMatch = line.match(gvr.lang.parser.DO);
        if (doMatch){
          var count = parseInt(doMatch[1],10);
          gvr.debug(indent+'do '+count+':');
          expressions.push(gvr.lang.newDo(this.lineIndex, count, this.parseBlock()));
          return true;
        }
        return false;
      },

      function parseIf(line, indent, expressions){
        var ifMatch = line.match(gvr.lang.parser.IF);
        if (ifMatch){
          var cond = ifMatch[1];
          if (cond in this.robot){
            gvr.debug(indent+'if '+cond+':');
            expressions.push(gvr.lang.newIf(this.lineIndex, this.robot[cond], this.robot, this.parseBlock()));
            return true;
          }
        }
        return false;
      },

      function parseElif(line, indent, expressions){
        var elifMatch = line.match(gvr.lang.parser.ELIF);
        if (elifMatch && expressions[expressions.length-1].name === 'if'){
          var cond = elifMatch[1];
          gvr.debug(indent+'elif '+cond+':');
          expressions[expressions.length-1].elifs.push(
            gvr.lang.newIf(this.lineIndex, this.robot[cond], this.robot, this.parseBlock()));
          return true;
        }
        return false;
      },

      function parseElse(line, indent, expressions){
        var elseMatch = line.match(gvr.lang.parser.ELSE);
        if (elseMatch && expressions[expressions.length-1].name === 'if'){
          gvr.debug(indent+'else:');
          expressions[expressions.length-1].elseBlock.expressions = this.parseBlock();
          return true;
        }
        return false;
      },

      function parseWhile(line, indent, expressions){
        var whileMatch = line.match(gvr.lang.parser.WHILE);
        if (whileMatch){
          cond = whileMatch[1];
          if (cond in this.robot){
            gvr.debug(indent+'while '+cond+':');
            expressions.push(gvr.lang.newWhile(this.lineIndex, this.robot[cond], this.robot, this.parseBlock()));
            return true;
          }
        }
        return false;
      },

      function parseDefine(line, indent, expressions){
        var defineMatch = line.match(gvr.lang.parser.DEFINE);
        if (defineMatch){
          var name = defineMatch[1];
          gvr.debug(indent+'define '+name+':');
          expressions.push(gvr.lang.newDefine(this.lineIndex, name, this.parseBlock()));
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
        var line = gvr.lang.parser.removeComment(this.lines[this.lineIndex]);
        if (line.indexOf(indent) !== 0){
          break;
        } else {
          line = line.slice(indent.length);
        }
        if (line.match(gvr.lang.parser.EMPTY_LINE)){
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
      var indentation = nextLine.match(gvr.lang.parser.INDENTATION)[1];
      var subExpressions = this.parseLines(indentation);
      this.lineIndex--;
      return subExpressions;
    }

  });


/**
 * Create a new {@link gvr.lang.parser.Parser} object
 * @param lines See {@link gvr.lang.parser.Parser#lines}
 * @param robot See {@link gvr.lang.parser.Parser#robot}
 * @returns gvr.lang.parser.Parser
 */
gvr.lang.parser.newParser = function(lines, robot){
  return new gvr.lang.parser.Parser(lines, robot);
};

module.exports = gvr.lang.parser;