const log = console.log.bind (console)
const lexer = require ('./')
module.exports = { StartTag, EndTag, Attribute, Comment, TokenBuilder }

// Token builder
// =============

// Takes a stream of chunks and builds 'tokens' in the sense of the whatWG specification. 
// Tokens then, are start-tags, end-tags, and text/ data nodes. 
// Doctype tokens aren't supported yet, also, scriptData isn't in the sense that preceding <!-- isn't handled. 

function StartTag (name) {
  this.name = name
  this.attributes = []
  this.selfClosing = false
}

function EndTag (name) {
  this.name = name
  this.selfClosing = false
  this.attributes = []
}

function Attribute (name) {
  this.name = name
  this.value = null
}

function Comment () {
  this.data = ''
}

// Builder state
// -------------

function TokenBuilder () {
  let output = [], token = null, attr = null,
    enumerable = true
  Object.defineProperties (this, {
    output: { enumerable, get: $=> output },
    token: { enumerable, get: $=> token },
    attr: { enumerable, get: $=> attr },
  })

  this.read = function* () {
    yield* output
    output = []
  }

  this.write = function write ([type, value]) {
    // log ('TokenBuilder.write', [type, value])
    if (type in handlers) handlers [type] (value)
    else throw new Error ('unknown token type '+type)
    // log ('==>', this._getState ())
  }

  this.end = function () {
    // log ('TokenBuilder.end, in state', this._getState ())
    attr = null
    if (token) emitToken (token) // Validate: may want to tag the token as being cut-off
  }

  function emitToken () {
    output.push (token)
    token = null
  }
  
  function emitData (data) {
    if (data) output.push (data)
  }
  
  // TODO: implement the char parsers; this may be tricky for non BMP characters/ 
  // where I need to reencode them to fit into JavaScript / UCS strings
  function parseDecimal (str) { throw new Error ('entity parsing not yet implemented') }
  function parseHex (str) { throw new Error ('entity parsing not yet implemented') }
  function parseNamed (str) { throw new Error ('entity parsing not yet implemented') }

  const handlers = 
  { commentStart: $=> token = new Comment ()
  , commentStartBogus: $=> token = new Comment ()
  , startTagStart: v => token = new StartTag (v.substr(1))
  , endTagStart: v => token = new EndTag (v.substr(2))
  , tagEndClose: $=> token.selfClosing = true
  , attributeName: v => token.attributes.push (attr = new Attribute (v))
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
  , rcdata: emitData
  , rawtext: emitData
  , plaintext: emitData
  , charRefDecimal: v => parseDecimal (v.substr (2))
  , charRefHex: v => parseHex (v.substr (3))
  , charRefNamed: v => parseNamed (v)
  }

}

TokenBuilder.build = function (lexemes) {
  const builder = new TokenBuilder ()
  const stream = build (lexemes, builder)
  stream.state = builder
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


