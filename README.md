A Tiny HTML5 lexer 
==================

[![NPM version][npm-image]][npm-url]

A **tiny** standard compliant HTML5 lexer and tokeniser. 
The minified bundle is currently **6.9k** bytes. 
Its small size should make it ideal for client side usage. 

The chunker preserves all input characters, so it is suitable for building a syntax highlighter or html editor on top of it as well. It is lazy/ on demand, so it does not unnecessarily buffer chunks. 
You can see a simple example/ of it running in the browser [here][1]. 

I would love for someone to build a tiny template language with it. 
Feel free to contact me with any questions. 

[1]: http://alwinb.github.io/tiny-html-lexer/example.html
[npm-image]: https://img.shields.io/npm/v/tiny-html-lexer.svg
[npm-url]: https://npmjs.org/package/tiny-html-lexer


API
---

The **tiny-html-lexer** module exposes two top level generator functions:

- chunks (input), a.k.a. lexemes
- tokens (input [, options]), a.k.a. tags

**chunks**, aka. **lexemes**

```javascript
let tinyhtml = require ('tiny-html-lexer')
let stream = tinyhtml.chunks ('<span>Hello, world</span>')
for (let chunk of stream)
  console.log (chunk)
```

Likewise, **tags**, aka. **tokens**

```javascript
let stream = tags ('<span>Hello, world</span>')
for (let token of stream)
  console.log (token)
```


#### Options: Named character references

⚠️ Only a very limited number of _named_ character references are supported by the token builder (i.e. `tags` parser), most of all because naively adding a map of entities would increase the code size about ten times, so I am thinking about a way to compress them. 

However, you can supply your own decoder to the **tags** function, by passing an options argument as follows:

```javascript
function parseNamedCharRef (string) {
  return string in myEntityMap ? myEntityMap [string] : string
}

let stream = tags ('<span>Hello, world</span>', { parseNamedCharRef })
for (let token of stream)
  console.log (token)
```

**Note** that the input is _not_ always a known HTML named character reference. It _does_ always start with `&`. It typically includes the terminating `;` character. However, the semicolon is not added to any non-terminated legacy named character references in the HTML source. 

#### Source positions

You can access the **chunks** lexer state as follows:

```javascript
let stream = tinyhtml.chunks ('<span>Hello, world</span>')
console.log (stream.state) // state before
for (let chunk of stream) {
  console.log (chunk)
  console.log (stream.state) // state after last seen chunk 
}
```

This is similar for **tags**, as follows. Note that this returns the state of the underlying **chunks** lexer.

```javascript
let stream = tinyhtml.tags ('<span>Hello, world</span>')
console.log (stream.state) // lexer state before
for (let chunk of stream) {
  console.log (chunk)
  console.log (stream.state) // lexer state after last seen chunk 
}
```


### Chunks

Chunks are produced by the **chunks** generator function. 
A chunk is a pair, i.e. an array [_type_, _data_] where _type_ is a string 
and _data_ is a chunk of the input string. 

The _type_ is one of:

- `"attributeName"`
- `"attributeAssign"`
- `"attributeValueStart"`
- `"attributeValueData"`
- `"attributeValueEnd"`
- `"tagSpace"`
- `"commentStart"`
- `"commentStartBogus"`
- `"commentData"`
- `"commentEnd"`
- `"commentEndBogus"`
- `"startTagStart"`
- `"endTagStart"`
- `"tagEnd"`
- `"tagEndClose"`
- `"charRefDecimal"`
- `"charRefHex"`
- `"charRefNamed"`
- `"unescaped"`
- `"data"`
- `"newline"`
- `"rcdata"`
- `"rawtext"`
- `"plaintext"`


### Lexer State

The generator returned from the **chunks** function has a property _state_ that provides access to the lexer state. This can be used to annotate chunks with source positions if needed. 

* LexerState
  - position — the current position into the input string
  - line — the current line number. The first line is line 1.
  - col — (getter) the position into the current line


### Tokens

The word _token_ has a specific meaning in the HTML5 standard. 
Tokens are more abstract than chunks.  
A 'Token' is a plain string, or an object that is an instance of 
*StartTag*, *EndTag*, *Whitespace*, *Comment* or *BogusComment*.

* StartTag
  - name — a string
  - attrs — an object (with null prototype) that stores the tag's attributes
  - selfClosing — an optional attribute, true if present
  - toString () — returns an HTML source string for the tag
* EndTag
  - name — string
  - toString ()
* Whitespace
  - data — A string, consisting solely of whitespace characters
  - toString ()
* Comment
  - data — The comment data (excluding start and end markers)
  - toString ()
* BogusComment
  - data — The comment data (excluding start and end markers)
  - toString ()


Limitations
-----------

- Doctype tokens are preserved, but are parsed as bogus comments rather than as doctype tokens. 
- CData (only used in svg/ foreign content) is likewise parsed as bogus comments. 


Changelog
------------

### 1.0.0-rc.2

- A few more changes, working up towards a version 1.0.0 release!
- The lexer state / source position is now also accessible from tags / token streams. 
- It is now possible to pass an external parseNamedCharRef function as an option to `tinyhtml.tags`.
- The project has been converted from commmonJS to an ES module.
- A bug has been fixed where the presence of attributes on an end-tag would throw an error. 

### 1.0.0-rc
- Wrapping up!
- The lexer now properly maintains a newline count and emits separate `"newline"` chunks.
- The token objects have changed a bit and are now described in the docs above. 
- Likewise for the lexer state. 
- The 'tags' function has been renamed to 'tokens', to align with the use of that word as in the HTML5 standard. It remains available under the name 'tags' as well. 

### 0.9.1
- The token builder now lowercases attribute names and handles duplicate attributes according to the standard (the first value is preserved).
- Some preliminary work has been done to emit newlines as separate `"newline"` chunks. 

### 0.9.0
- Rewrote the lexer runtime. 
- Added a token builder! Use `tinyhtml.tags (string)` to get a lazy stream (an iterator) of tag objects and data strings. 
- Disabled the typescript annotations for the time being. 
- The types have been renamed to use camelCase. 

### 0.8.5
- Fix an issue introduced in version 0.8.4 where terminating semicolons after legacy character references would be tokenised as data. 

### 0.8.4
- Correct handling of legacy (unterminated) named character references. 

### 0.8.3
- Added typescript annotations. 
- Token type `attribute-equals` has been renamed to `attribute-assign`. 
- Renamed export `tokens` to `tokenTypes`. 

### 0.8.1
- Fix for incorrect parsing of slashes between attributes. 

### 0.8.0
- First public release. 


Some implementation details
---------------------------

The idea is that the lexical grammar can be very compactly expressed by
a state machine that has transitions labeled with regular expressions
rather than individual characters. 

I am using regular expressions without capture groups for the transitions. 
For each state, the outgoing transitions are then wrapped in parentheses to 
create a capture group and then are all joined together as alternates in
a single regular expression per state. When this regular expression is 
executed, one can then check which transition was taken by checking which
index in the result of regex.exec is present. 


License
-----------

MIT. 

Enjoy!
