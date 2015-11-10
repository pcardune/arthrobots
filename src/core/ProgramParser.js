
var lang = require('./lang');

export var TOKENS = {
  IDENTIFIER: 'identifier',
  DEFINE: 'define',
  IF: 'if',
  ELSE: 'else',
  ELIF: 'elif',
  WHILE: 'while',
  DO: 'do',
  NUMBER: 'number',
  NEWLINE: '\n',
  INDENT: 'indent',
  DEDENT: 'dedent',
  COLON: ':',
  EOF: 'eof'
}

class ParseError {
  constructor(lineNumber, description) {
    this.message = `${description} line: ${lineNumber+1}`
    this.lineNumber = lineNumber
    this.description = description
  }
}

export default function ProgramParser(code, builtins) {
  this.code = code;
  this.builtins = builtins;
  this.charIndex = 0;
  this.curIndent = 0;
  this.indentStack = [0];
  this.identifier = null;
  this.number = null;
  this.currentLine = 0;
};

ProgramParser.prototype.getToken = function() {
  if (this.code[this.charIndex] == ' ') {
    if (this.code[this.charIndex-1] == '\n') {
      // pay attention to whitespace at the beginning of a line
      var indent = '';
      while (this.code[this.charIndex] == ' ' && this.charIndex < this.code.length) {
        indent += ' ';
        this.charIndex++;
      }
      if (this.code[this.charIndex] != '\n' && this.code[this.charIndex] != '#') {
        var curIndent = this.indentStack[this.indentStack.length-1];
        if (curIndent > indent.length) {
          this.indentStack.pop();
          this.charIndex -= indent.length;
          return TOKENS.DEDENT;
        } else if (indent.length > curIndent) {
          this.indentStack.push(indent.length);
          return TOKENS.INDENT;
        } else {
          // indentation is equal, so just skip
          return this.getToken();
        }
      }
    } else {
      // don't pay attention to whitespace not at the beginning of a line
      while (this.code[this.charIndex] == ' ') {
        this.charIndex++;
      }
    }
  } else if (this.code[this.charIndex-1] == '\n' && this.indentStack[this.indentStack.length-1] > 0) {
    var nextTokenStart = this.charIndex;
    var indent = 0
    while (this.code[nextTokenStart] && (this.code[nextTokenStart] == '\n' || this.code[nextTokenStart] == ' ')) {
      if (this.code[nextTokenStart] == '\n') {
        indent = 0;
      } else {
        indent++;
      }
      // skip over blank new lines and go until you find the beginning of the next token
      nextTokenStart++;
    }
    if (this.indentStack[this.indentStack.length-1] > indent) {
      this.indentStack.pop();
      return TOKENS.DEDENT;
    }
  }

  var isAlpha = function(c) {
    return (c >= 'A' && c <= 'z') || c == '_';
  }

  var isAlphaNum = function(c) {
    return isAlpha(c) || (c >= '0' && c <= '9');
  }

  this.identifier = '';
  if (isAlpha(this.code[this.charIndex])) {
    //identifier, eat up the entire identifier
    while (isAlphaNum(this.code[this.charIndex])) {
      this.identifier += this.code[this.charIndex++];
    }
    switch (this.identifier) {
      case 'define':
      return TOKENS.DEFINE;
      case 'while':
      return TOKENS.WHILE;
      case 'if':
      return TOKENS.IF;
      case 'else':
      return TOKENS.ELSE;
      case 'elif':
      return TOKENS.ELIF;
      case 'do':
      return TOKENS.DO;
      default:
      return TOKENS.IDENTIFIER;
    }
  }

  if (this.code[this.charIndex] >= '0' && this.code[this.charIndex] <= '9') {
    this.number = '';
    while (this.code[this.charIndex] >= '0' && this.code[this.charIndex] <= '9') {
      this.number += this.code[this.charIndex++];
    }
    this.number = parseInt(this.number);
    return TOKENS.NUMBER;
  }

  if (this.code[this.charIndex] == '#') {
    while (this.code[this.charIndex] != '\n' && this.charIndex < this.code.length) {
      this.charIndex++;
    }
    return this.getToken();
  }

  if (this.code[this.charIndex] == ':') {
    return this.code[this.charIndex++];
  }

  if (this.code[this.charIndex] == '\n') {
    this.currentLine++;
    return this.code[this.charIndex++];
  }

  if (this.code[this.charIndex] == undefined) {
    return TOKENS.EOF;
  }

  return this.code[++this.charIndex];
};

ProgramParser.prototype.getNumTokens = function() {
  var count = 0;
  while (this.getToken() != TOKENS.EOF) {
    count += 1;
  }
  return count;
}

ProgramParser.prototype.parseNewBlock = function() {
  if (this.getToken() != TOKENS.COLON) {
    throw new ParseError(this.currentLine, "Expected a colon.");
  }
  if (this.getToken() != TOKENS.NEWLINE) {
    throw new ParseError(this.currentLine, "Expected a newline.");
  }
  var token;
  while ((token = this.getToken()) == TOKENS.NEWLINE) {
    continue
  }
  if (token != TOKENS.INDENT) {
    throw new ParseError(this.currentLine, "Expected an indented block.");
  }
};

ProgramParser.prototype.parseDefine = function() {
  var identifier = this.getToken();
  if (identifier != TOKENS.IDENTIFIER) {
    throw new ParseError(this.currentLine, "Expected a function name after define.");
  }
  var funcName = this.identifier;
  var funcLine = this.currentLine;
  this.parseNewBlock();
  var expressions = this.parseBlock();
  return new lang.Define(funcLine, funcName, expressions);
};

ProgramParser.prototype.parseDo = function() {
  var numberToken = this.getToken();
  if (numberToken != TOKENS.NUMBER) {
    throw new ParseError(this.currentLine, "Expected number after do.");
  }
  var number = this.number;
  var doLine = this.currentLine;
  this.parseNewBlock();
  var expressions = this.parseBlock();
  return new lang.Do(doLine, number, expressions);
};

ProgramParser.prototype.parseIdentifier = function() {
  if (this.builtins[this.identifier]) {
    return new lang.Expression(this.currentLine, this.builtins[this.identifier], this.builtins);
  } else {
    return new lang.FunctionCall(this.currentLine, this.identifier);
  }
};

ProgramParser.prototype.parseIf = function() {
  var identifierToken = this.getToken();
  if (identifierToken != TOKENS.IDENTIFIER) {
    throw new ParseError(this.currentLine, "Expected a conditional expression after an if.");
  }
  var conditionIdentifier = this.identifier;
  var ifLine = this.currentLine;
  this.parseNewBlock();
  var expressions = this.parseBlock();
  return new lang.If(ifLine, this.builtins[conditionIdentifier], this.builtins, expressions);
};

ProgramParser.prototype.parseElif = function(ifStatement) {
  if (!ifStatement || !ifStatement.elifs) {
    throw new ParseError(this.currentLine, "elif statement can only come after an if statement.");
  }
  var identifierToken = this.getToken();
  if (identifierToken != TOKENS.IDENTIFIER) {
    throw new ParseError(this.currentLine, "Expected a conditional expression after an elif.");
  }
  var conditionIdentifier = this.identifier;
  var elifLine = this.currentLine;
  this.parseNewBlock();
  var expressions = this.parseBlock();
  ifStatement.elifs.push(new lang.If(elifLine, this.builtins[conditionIdentifier], this.builtins, expressions));
};

ProgramParser.prototype.parseElse = function(ifStatement) {
  if (!ifStatement || !ifStatement.elseBlock) {
    throw new ParseError(this.currentLine, "elif statement can only come after an if statement.");
  }
  this.parseNewBlock();
  var expressions = this.parseBlock();
  ifStatement.elseBlock = new lang.Block(expressions);
};

ProgramParser.prototype.parseWhile = function() {
  var identifierToken = this.getToken();
  if (identifierToken != TOKENS.IDENTIFIER) {
    throw new ParseError(this.currentLine, "Expected a conditional expression after a while.");
  }
  var conditionIdentifier = this.identifier;
  var line = this.currentLine;
  this.parseNewBlock();
  var expressions = this.parseBlock();
  return new lang.While(line, this.builtins[conditionIdentifier], this.builtins, expressions);
};

ProgramParser.prototype.parseBlock = function() {
  var expressions = [];
  var currentToken;
  while ((currentToken = this.getToken()) != TOKENS.EOF) {
    var nextExpression = null;
    switch (currentToken) {
    case TOKENS.DEFINE:
    nextExpression = this.parseDefine();
    break;
    case TOKENS.DO:
    nextExpression = this.parseDo();
    break;
    case TOKENS.IDENTIFIER:
    nextExpression = this.parseIdentifier();
    break;
    case TOKENS.IF:
    nextExpression = this.parseIf();
    break;
    case TOKENS.ELIF:
    nextExpression = this.parseElif(expressions[expressions.length-1]);
    break;
    case TOKENS.ELSE:
    nextExpression = this.parseElse(expressions[expressions.length-1]);
    break;
    case TOKENS.WHILE:
    nextExpression = this.parseWhile();
    break;
    case TOKENS.DEDENT:
    return expressions;
    }
    if (nextExpression) {
      expressions.push(nextExpression);
      nextExpression = null;
    }
  }
  return expressions;
};

ProgramParser.prototype.parse = function() {
  var expressions = this.parseBlock();
  return new lang.Block(expressions);
};

ProgramParser.prototype.wrapJSForEval = function() {
  var js = "(function(";
  for (var key in this.builtins) {
    if (typeof this.builtins[key] == "function") {
      js += key+',';
    }
  }
  // remove trailing , from argument list
  js = js.slice(0, js.length - 1);

  js += "){\n";
  js += this.code;
  js += "})("
  for (var key in this.builtins) {
    if (typeof this.builtins[key] == "function") {
      js += 'robot.'+key+',';
    }
  }
  // remove trailing , again
  js = js.slice(0, js.length - 1)
  js += ")";
  return js;
};
