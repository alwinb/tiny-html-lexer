const log = console.log.bind (console)

// Token builder
// =============

// Takes a stream of chunks and builds 'tokens' in the sense of the whatWG specification. 
// Tokens then, are start-tags, end-tags, and text/ data nodes. 
// Doctype tokens aren't supported yet, also, scriptData isn't in the sense that preceding <!-- isn't handled. 

class StartTag {
  constructor (name) { 
    this.name = name
    this.attrs = Object.create (null)
  }
  toString () {
    return `<${this.name}${ _printAtts (this.attrs)}${this.selfClosing ? '/' : ''}>`
  }
}

class EndTag {
  constructor (name) { this.name = name }
  toString () { return `</${this.name}>` }
}

function _printAtts (obj) { let r = ''
  for (const [k,v] of Object.entries (obj)) 
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
  let output = [], token = null, attr = null, value = null
  Object.defineProperty (this, 'state', { get: () => ({ output, token, attr, value }) })

  this.read = function* () {
    yield* output
    output = []
  }

  this.write = function write ([type, value]) {
    if (type in handlers) handlers [type] (value)
    else throw new Error ('Unknown token type: '+type)
  }

  this.end = function () {
    // log ('TokenBuilder.end, in state', this._getState ())
    if (token) emitToken (token) // Validate: may want to tag the token as being cut-off
    token = attr = value = null
  }

  function emitToken () {
    if (token)
    output.push (token)
    token = attr = null
  }

  function emitData (data) {
    if (data) {
      if (value != null) value += data
      else output.push (data)
    }
  }

  function emitSpace (data) {
    if (data) {
      if (value != null) value += data
      else output.push (new Whitespace (data))
    }
  }

  // Exception: Numeric references 0x80-0x9F are decoded, using the Windows-1252 codepage.
  // In Unicode these code-points correspond to the non-printable C1 contol characters. 
  // <https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state>

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
  , tagEndClose: $=> (token.selfClosing = true, emitToken ())
  , attributeName: v => (attr = v.toLowerCase (), (token.attrs||{}) [attr] = '')
  , tagSpace: $=> token // space between attributes e/a/ is ignored
  , attributeAssign: $=> value = ''
  , attributeValueStart: $=> value = ''
  , attributeValueData: v => value +=v
  , attributeValueEnd: $=> ((token.attrs||{}) [attr] = value, attr = value = null)
  , commentData: v => token.data += v
  , commentEnd: emitToken
  , commentEndBogus: emitToken
  , tagEnd: emitToken
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
  const stream = _build (lexemes, builder)
  Object.defineProperty (stream, 'state', { get:() => builder.state })
  return stream
}

function* _build (lexemes, builder) {
  for (let token of lexemes) {
    builder.write (token)
    yield* builder.read ()
  }
  builder.end ()
  yield* builder.read ()
}


// Exports
// -------

export {
  StartTag, EndTag, Whitespace, Comment,
  TokenBuilder, parseNamedCharRef,
  _build
}