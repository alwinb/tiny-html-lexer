const tinyhtml = require ('../lib')
const util = require ('util')
const log = console.log.bind (console)

var sample = '<span>Hello, world</span>'
var sample = '<span>&lt&#x1F33F; Hello, world!\n&#129421;&gt</span attr="&lt=&lt"> Test &abs d'
var sample = '<span cLass="foo" class="bar" Class=bee bar baz="a\nb">\n'
var sample = '<script>\n'
var sample = '<plaintext>\n'
var sample = '<textarea>\r'

var stream = tinyhtml.chunks (sample)

//log (stream.state)
for (let chunk of stream) {
  log (chunk)
  //log (stream.state)
}


var stream = tinyhtml.tags (sample)
//log (stream.state)
for (let token of stream) {
  log (util.inspect (token))
  //log (stream.state)
}
