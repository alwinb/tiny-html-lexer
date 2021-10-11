import * as tinyhtml from '../lib/index.js'
import * as util from 'util'
const log = console.log.bind (console)

var sample = '<span>Hello, world</span>'
var sample = '<span cLass="foo" class="bar" Class=bee bar baz="a\nb">\n'
var sample = '<script>\n'
var sample = '<plaintext>\n'
var sample = '<textarea>\r'
var sample = '<textarea>Foo<script></textarea bar=bee>'
var sample = '<span f=&amp>&lt&#x1F33F; Hello, world!\n&#129421;&gt</span attr="&lt=&lt"> Test &abss; d'


log ('Chunks\n======\n')
var stream = tinyhtml.chunks (sample)
//log (stream.state)
for (let chunk of stream) {
  log (chunk)
  //log (stream.state)
}


log ('\nTags\n====\n')
var stream = tinyhtml.tags (sample, { parseNamedCharRef })
//log (stream.state)
for (let token of stream) {
  log (util.inspect (token))
  //log (stream.state)
}


function parseNamedCharRef (x) {
  const y = tinyhtml.parseNamedCharRef (x)
  if (y == x) console.log ('!! unknown char ref', x)
  return y
}