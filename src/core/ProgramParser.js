var TOKENS = {
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


var ProgramParser = function(code) {
  this.code = code;
  this.charIndex = 0;
  this.curIndent = 0;
  this.indentStack = [0];
  this.identifier = null;
  this.number = null;
  this.currentToken = null;
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
      if (this.code[this.charIndex] != '\n') {
        var curIndent = this.indentStack[this.indentStack.length-1];
        if (indent.length < curIndent) {
          this.indentStack.pop();
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

  this.identifier = '';
  if (this.code[this.charIndex] >= 'A' && this.code[this.charIndex] <= 'z') {
    //identifier, eat up the entire identifier
    while (this.code[this.charIndex] >= 'A' && this.code[this.charIndex] <= 'z') {
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
    return this.code[this.charIndex++];
  }

  if (this.code[this.charIndex] == undefined) {
    return TOKENS.EOF;
  }

  return this.code[++this.charIndex];
};

ProgramParser.prototype.parseNewBlock = function() {
  if (this.getToken() != TOKENS.COLON) {
    throw new Error("Expected a colon");
  }
  if (this.getToken() != TOKENS.NEWLINE) {
    throw new Error("Expected a newline");
  }
  if (this.getToken() != TOKENS.INDENT) {
    throw new Error("Expected an indented block");
  }
};

ProgramParser.prototype.parseDefine = function() {
  var identifier = this.getToken();
  if (identifier != TOKENS.IDENTIFIER) {
    throw new Error("Expected a function name after define");
  }
  var funcName = this.identifier;
  this.parseNewBlock();
  console.log("> Parsed function prototype with name", funcName);
  this.parseBlock();
  console.log("< done parsing define", funcName);
};

ProgramParser.prototype.parseDo = function() {
  var numberToken = this.getToken();
  if (numberToken != TOKENS.NUMBER) {
    throw new Error("Expected number after do");
  }
  var number = this.number;
  this.parseNewBlock();
  console.log("> Parsed a do loop with number", number);
  this.parseBlock();
  console.log("< done parsing do block");
};

ProgramParser.prototype.parseIdentifier = function() {
  console.log("Parsed an identifier:", this.identifier);
};

ProgramParser.prototype.parseIf = function() {
  var identifierToken = this.getToken();
  if (identifierToken != TOKENS.IDENTIFIER) {
    throw new Error("Expected a conditional expression after an if");
  }
  var conditionIdentifier = this.identifier;
  this.parseNewBlock();
  console.log("> parsed an if:", conditionIdentifier);
  this.parseBlock();
  console.log("< done parsing if", conditionIdentifier);
};

ProgramParser.prototype.parseElif = function() {
  var identifierToken = this.getToken();
  if (identifierToken != TOKENS.IDENTIFIER) {
    throw new Error("Expected a conditional expression after an elif");
  }
  var conditionIdentifier = this.identifier;
  this.parseNewBlock();
  console.log("> parsed an elif:", conditionIdentifier);
  this.parseBlock();
  console.log("< done parsing elif", conditionIdentifier);
};

ProgramParser.prototype.parseElse = function() {
  this.parseNewBlock();
  console.log("> parsed an else");
  this.parseBlock();
  console.log("< done parsing else block");
};

ProgramParser.prototype.parseWhile = function() {
  var identifierToken = this.getToken();
  if (identifierToken != TOKENS.IDENTIFIER) {
    throw new Error("Expected a conditional expression after a while");
  }
  var conditionIdentifier = this.identifier;
  this.parseNewBlock();
  console.log("> parsed a while:", conditionIdentifier);
  this.parseBlock();
  console.log("< done parsing while", conditionIdentifier);
};

ProgramParser.prototype.parseBlock = function() {
  while ((this.currentToken = this.getToken()) != TOKENS.EOF) {
    switch (this.currentToken) {
    case TOKENS.DEFINE:
    this.parseDefine();
    break;
    case TOKENS.DO:
    this.parseDo();
    break;
    case TOKENS.IDENTIFIER:
    this.parseIdentifier();
    break;
    case TOKENS.IF:
    this.parseIf();
    break;
    case TOKENS.ELIF:
    this.parseElif();
    break;
    case TOKENS.ELSE:
    this.parseElse();
    break;
    case TOKENS.WHILE:
    this.parseWhile();
    break;
    case TOKENS.DEDENT:
    return;
    }
  }
};

ProgramParser.prototype.parse = function() {
  this.parseBlock();
};

module.exports = ProgramParser;