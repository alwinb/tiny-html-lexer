const { chunks } = require ('../lib/tiny-lexer')
const { TokenBuilder } = require ('../lib/token-builder')
const log = console.log.bind (console)

const build = TokenBuilder.build

// test

var sample  = '<span foo = "" bar><!-This is a comment->'
var sample2 = '<span foo bar>bas\nbee\nbuzz<i'
var sample3 = '<span cLass="foo" class="bar" Class=bee bar baz="a\nb">\n'

var stream = chunks (sample3)
var r = [...build (stream)]
log (r)



