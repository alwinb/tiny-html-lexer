A tiny HTML5 lexer 
==================

A tiny standard compliant HTML5 lexer/ chunker. 
Its small size should make it ideal for client side usage. 

The chunker preserves all input characters, so it is suitable for building 
a syntax highlighter or html editor on top of it as well, if you like. 

It is lazy/ on demand, so it does not unnecessarily buffer chunks. 
You can see a simple example/ of it running in the browser [here][1]. 

I would love for someone to build a tiny template language with it. 
Feel free to contact me with any questions. 

[1]: http://alwinb.github.io/tiny-html-lexer/example.html

Api
---

Simply, one top level function `chunks` that returns an iterator.

```javascript
let tinyhtml = require ('tiny-html-lexer')
let stream = tinyhtml.chunks ('<span>Hello, world</span>')
for (let chunk of stream)
  console.log (chunk)
```

You can access the lexer state as follows.  
(API may change a bit, still). 

```javascript
let tinyhtml = require ('tiny-html-lexer')
let stream = tinyhtml.chunks ('<span>Hello, world</span>')
console.log (stream.state) // state before
for (let chunk of stream) {
  console.log (chunk)
  console.log (stream.state) // state after last seen chunk 
}
```

### Tokens

Tokens are tuples (arrays) `[type, data]` where `type` is a string
and `data` is a chunk of the input string. 

`type` is one of:

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
- `"rcdata"`
- `"rawtext"`
- `"plaintext"`


Limitations
-----------

- Doctype tokens are preserved, but are parsed as bogus comments
rather than as doctype tokens. 

- CData (only used in svg/ foreign content) is likewise parsed as 
bogus comments. 
 

Changelog
------------

### 0.8.5
- Fix an issue introduced in version 0.8.4 where terminating semicolons 
after legacy character references would be tokenized as data. 

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
