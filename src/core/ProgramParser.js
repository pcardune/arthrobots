
import * as lang from './lang'

export const TOKENS = {
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

export default class ProgramParser {
  constructor(code, builtins) {
    this.code = code
    this.builtins = builtins
    this.charIndex = 0
    this.lineIndex = 0
    this.colIndex = 0
    this.curIndent = 0
    this.indentStack = [0]
    this.identifier = null
    this.number = null
  }

  getch() {
    let ch = this.code[this.charIndex]
    this.charIndex++
    this.colIndex++
    if (ch == '\n') {
      this.colIndex = 0
      this.lineIndex++
    }
    return ch
  }

  peek(delta=0) {
    return this.code[this.charIndex+delta]
  }

  getToken() {
    if (this.peek() == ' ') {
      if (this.peek(-1) == '\n') {
        // pay attention to whitespace at the beginning of a line
        let indent = ''
        while (this.peek() == ' ' && this.charIndex < this.code.length) {
          indent += ' '
          this.getch()
        }
        if (this.peek() != '\n' && this.peek() != '#') {
          var curIndent = this.indentStack[this.indentStack.length-1]
          if (curIndent > indent.length) {
            this.indentStack.pop()
            this.charIndex -= indent.length
            this.colIndex -= indent.length
            return TOKENS.DEDENT
          } else if (indent.length > curIndent) {
            this.indentStack.push(indent.length)
            return TOKENS.INDENT
          } else {
            // indentation is equal, so just skip
            return this.getToken()
          }
        }
      } else {
        // don't pay attention to whitespace not at the beginning of a line
        while (this.peek() == ' ') {
          this.getch()
        }
      }
    } else if (this.peek(-1) == '\n' && this.indentStack[this.indentStack.length-1] > 0) {
      var nextTokenStart = this.charIndex
      let indent = 0
      while (this.code[nextTokenStart] && (this.code[nextTokenStart] == '\n' || this.code[nextTokenStart] == ' ')) {
        if (this.code[nextTokenStart] == '\n') {
          indent = 0
        } else {
          indent++
        }
        // skip over blank new lines and go until you find the beginning of the next token
        nextTokenStart++
      }
      if (this.indentStack[this.indentStack.length-1] > indent) {
        this.indentStack.pop()
        return TOKENS.DEDENT
      }
    }

    var isAlpha = function(c) {
      return (c >= 'A' && c <= 'z') || c == '_'
    }

    var isAlphaNum = function(c) {
      return isAlpha(c) || (c >= '0' && c <= '9')
    }

    this.identifier = ''
    if (isAlpha(this.peek())) {
      //identifier, eat up the entire identifier
      while (isAlphaNum(this.peek())) {
        this.identifier += this.getch()
      }
      switch (this.identifier) {
      case 'define':
        return TOKENS.DEFINE
      case 'while':
        return TOKENS.WHILE
      case 'if':
        return TOKENS.IF
      case 'else':
        return TOKENS.ELSE
      case 'elif':
        return TOKENS.ELIF
      case 'do':
        return TOKENS.DO
      default:
        return TOKENS.IDENTIFIER
      }
    }

    if (this.peek() >= '0' && this.peek() <= '9') {
      this.number = ''
      while (this.peek() >= '0' && this.peek() <= '9') {
        this.number += this.getch()
      }
      this.number = parseInt(this.number)
      return TOKENS.NUMBER
    }

    if (this.peek() == '#') {
      while (this.peek() != '\n' && this.charIndex < this.code.length) {
        this.getch()
      }
      return this.getToken()
    }

    if (this.peek() == ':') {
      return this.getch()
    }

    if (this.peek() == '\n') {
      return this.getch()
    }

    if (this.peek() == undefined) {
      return TOKENS.EOF
    }

    return this.getch()
  }

  getNumTokens() {
    var count = 0
    while (this.getToken() != TOKENS.EOF) {
      count += 1
    }
    return count
  }

  parseNewBlock() {
    var token = this.getToken()
    if (token != TOKENS.COLON) {
      if (token == TOKENS.NEWLINE) {
        throw new ParseError(this.lineIndex-1, "Expected a colon.")
      } else {
        throw new ParseError(this.lineIndex, "Expected a colon.")
      }
    }
    if (this.getToken() != TOKENS.NEWLINE) {
      throw new ParseError(this.lineIndex, "Expected a newline.")
    }
    while ((token = this.getToken()) == TOKENS.NEWLINE) {
      continue
    }
    if (token != TOKENS.INDENT) {
      throw new ParseError(this.lineIndex, "Expected an indented block.")
    }
  }

  parseDefine() {
    var identifier = this.getToken()
    if (identifier != TOKENS.IDENTIFIER) {
      throw new ParseError(this.lineIndex, "Expected a function name after define.")
    }
    var funcName = this.identifier
    var funcLine = this.lineIndex
    this.parseNewBlock()
    var expressions = this.parseBlock()
    return new lang.Define(funcLine, funcName, expressions)
  }

  parseDo() {
    var numberToken = this.getToken()
    if (numberToken != TOKENS.NUMBER) {
      throw new ParseError(this.lineIndex, "Expected number after do.")
    }
    var number = this.number
    var doLine = this.lineIndex
    this.parseNewBlock()
    var expressions = this.parseBlock()
    return new lang.Do(doLine, number, expressions)
  }

  parseIdentifier() {
    if (this.builtins[this.identifier]) {
      return new lang.Expression(this.lineIndex, this.builtins[this.identifier], this.builtins)
    } else {
      return new lang.FunctionCall(this.lineIndex, this.identifier)
    }
  }

  parseIf() {
    var identifierToken = this.getToken()
    if (identifierToken != TOKENS.IDENTIFIER) {
      throw new ParseError(this.lineIndex, "Expected a conditional expression after an if.")
    }
    var conditionIdentifier = this.identifier
    if (!this.builtins[this.identifier]) {
      throw new ParseError(this.lineIndex, `Unrecognized conditional expression "${this.identifier}".`)
    }
    var ifLine = this.lineIndex
    this.parseNewBlock()
    var expressions = this.parseBlock()
    return new lang.If(ifLine, this.builtins[conditionIdentifier], this.builtins, expressions)
  }

  parseElif(ifStatement) {
    if (!ifStatement || !ifStatement.elifs) {
      throw new ParseError(this.lineIndex, "elif statement can only come after an if statement.")
    }
    var identifierToken = this.getToken()
    if (identifierToken != TOKENS.IDENTIFIER) {
      throw new ParseError(this.lineIndex, "Expected a conditional expression after an elif.")
    }
    var conditionIdentifier = this.identifier
    if (!this.builtins[this.identifier]) {
      throw new ParseError(this.lineIndex, `Unrecognized conditional expression "${this.identifier}".`)
    }
    var elifLine = this.lineIndex
    this.parseNewBlock()
    var expressions = this.parseBlock()
    ifStatement.elifs.push(new lang.If(elifLine, this.builtins[conditionIdentifier], this.builtins, expressions))
  }

  parseElse(ifStatement) {
    if (!ifStatement || !ifStatement.elseBlock) {
      throw new ParseError(this.lineIndex, "else statement can only come after an if statement.")
    }
    this.parseNewBlock()
    var expressions = this.parseBlock()
    ifStatement.elseBlock = new lang.Block(expressions)
  }

  parseWhile() {
    var identifierToken = this.getToken()
    if (identifierToken != TOKENS.IDENTIFIER) {
      throw new ParseError(this.lineIndex, "Expected a conditional expression after a while.")
    }
    var conditionIdentifier = this.identifier
    var line = this.lineIndex
    this.parseNewBlock()
    var expressions = this.parseBlock()
    return new lang.While(line, this.builtins[conditionIdentifier], this.builtins, expressions)
  }

  parseBlock() {
    var expressions = []
    var currentToken
    while ((currentToken = this.getToken()) != TOKENS.EOF) {
      var nextExpression = null
      switch (currentToken) {
      case TOKENS.DEFINE:
        nextExpression = this.parseDefine()
        break
      case TOKENS.DO:
        nextExpression = this.parseDo()
        break
      case TOKENS.IDENTIFIER:
        nextExpression = this.parseIdentifier()
        break
      case TOKENS.IF:
        nextExpression = this.parseIf()
        break
      case TOKENS.ELIF:
        nextExpression = this.parseElif(expressions[expressions.length-1])
        break
      case TOKENS.ELSE:
        nextExpression = this.parseElse(expressions[expressions.length-1])
        break
      case TOKENS.WHILE:
        nextExpression = this.parseWhile()
        break
      case TOKENS.DEDENT:
        return expressions
      }
      if (nextExpression) {
        expressions.push(nextExpression)
        nextExpression = null
      }
    }
    return expressions
  }

  parse() {
    var expressions = this.parseBlock()
    return new lang.Block(expressions)
  }

  wrapJSForEval() {
    var js = "(function("
    for (let key in this.builtins) {
      if (typeof this.builtins[key] == "function") {
        js += key+','
      }
    }
    // remove trailing , from argument list
    js = js.slice(0, js.length - 1)

    js += "){\n"
    js += this.code
    js += "})("
    for (let key in this.builtins) {
      if (typeof this.builtins[key] == "function") {
        js += 'robot.'+key+','
      }
    }
    // remove trailing , again
    js = js.slice(0, js.length - 1)
    js += ")"
    return js
  }
}
