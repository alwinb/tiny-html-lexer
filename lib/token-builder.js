const log = console.log.bind (console)
const lexer = require ('./')

// Token builder
// =============

// Takes a stream of chunks and builds 'tokens' in the sense of the whatWG specification. 
// Tokens then, are start-tags, end-tags, and text/ data nodes. 
// Doctype tokens aren't supported yet, also, scriptData isn't in the sense that preceding <!-- isn't handled. 

// I'm using an extended Map object to store the attributes
//  within and name/ selfClosing as properties on top.

class StartTag extends Map {
  constructor (name) { (super (), this.name = name) }
  toString () { return `<${this.name}${ _printAtts (this)}${this.selfClosing ? '/' : ''}>` }
}

class EndTag {
  constructor (name) { this.name = name }
  toString () { return `</${this.name}>` }
}

function _printAtts (map) { let r = ''
  for (const [k,v] of map.entries ()) 
    r += v === ''
      ? ` ${k}`
      : ` ${k}="${v.replace (/"/g, '&quot;')}"`
  return r
}

// Restriction on comment data:
// must not start with ">", nor start with "->", 
// must not contain "<!--", "-->", or "--!>", 
// must not end with "<!-".

class Comment {
  constructor (data = '') { this.data = data }
  toString () { return `<!--${this.data}-->` }
}

class BogusComment extends Comment {}

class Whitespace {
  constructor (data = '') { this.data = data }
  toString () { return this.data }
}

//

function _Attribute (name) {
  this.name = name
  this.value = ''
}

// Builder state
// -------------

const parseNamedCharRef = str =>
  namedCharRefs [/^\&(.*);?$/ .exec (str) [1]] || str

const namedCharRefs = {
  'amp':'&',
  'lt':'<',
  'gt':'>',
  'quot':'"',
  'AMP':'&',
  'LT':'<',
  'GT':'>',
  'QUOT':'"',
  'apos':"'",
}


function TokenBuilder ({ parseNamedCharRef:parseNamed = parseNamedCharRef } = {}) {
  let output = [], token = null, attrs = [], attr = null
  Object.defineProperty (this, 'state', { get: () => ({ output, token, attrs, attr }) })

  this.read = function* () {
    yield* output
    output = []
  }

  this.write = function write ([type, value]) {
    // log ('TokenBuilder.write', { token, attrs, attr }, [type, value])
    if (type in handlers) handlers [type] (value)
    else throw new Error ('Unknown token type: '+type)
  }

  this.end = function () {
    // log ('TokenBuilder.end, in state', this._getState ())
    if (token) emitToken (token) // Validate: may want to tag the token as being cut-off
    attrs = []; token = attr = null
  }

  function emitToken () {
    if (token instanceof StartTag)
      for (let { name, value } of attrs)
        if (!token.has (name)) token.set (name, value)
    output.push (token)
    attrs = []; token = attr = null
  }

  function emitData (data) {
    if (data) {
      if (attr) attr.value += data
      else output.push (data)
    }
  }

  function emitSpace (data) {
    if (data) {
      if (attr) attr.value += data
      else output.push (new Whitespace (data))
    }
  }

  // Exception: Numeric references 0x80-0x9F get mapped as follows:
  const _exceptions =
    '€\x81‚ƒ„…†‡ˆ‰Š‹Œ\x8DŽ\x8F\x90‘’“”•–—˜™š›œ\x8DžŸ'

  const parseNumeric = (str, base) => {
    const n = parseInt (str, base)
    return 0x80 <= n && n <= 0x9F ?
      _exceptions [n - 0x80] :
      String.fromCodePoint (n) }

  const handlers = 
  { commentStart: $=> token = new Comment ()
  , commentStartBogus: $=> token = new BogusComment ()
  , startTagStart: v => token = new StartTag (v.substr(1))
  , endTagStart: v => token = new EndTag (v.substr(2))
  , tagEndClose: $=> token.selfClosing = true
  , attributeName: v => attrs.push (attr = new _Attribute (v.toLowerCase ()))
  , tagSpace: $=> token // space between attributes e/a/ is ignored
  , attributeAssign: $=> attr.value = ''
  , attributeValueStart: $=> attr.value = ''
  , attributeValueData: v => attr.value +=v
  , attributeValueEnd: $=> attr = null
  , commentData: v => token.data += v
  , tagEnd: emitToken
  , commentEnd: emitToken
  , commentEndBogus: emitToken
  , unescaped: emitData
  , data: emitData
  , space: emitSpace
  , newline: emitSpace
  , rcdata: emitData
  , rawtext: emitData
  , plaintext: emitData
  , charRefDecimal: v => emitData (parseNumeric (v.substr (2), 10)) // TODO these may become space too
  , charRefHex: v => emitData (parseNumeric (v.substr (3), 16))
  , charRefNamed: v => emitData (parseNamed (v))
  }

}

TokenBuilder.build = function (lexemes) {
  const builder = new TokenBuilder ()
  const stream = build (lexemes, builder)
  Object.defineProperty (stream, 'state', { get:() => builder.state })
  return stream
}

function* build (lexemes, builder) {
  for (let token of lexemes) {
    builder.write (token)
    yield* builder.read ()
  }
  builder.end ()
  yield* builder.read ()
}


module.exports = { StartTag, EndTag, Whitespace, Comment, TokenBuilder, parseNamedCharRef }