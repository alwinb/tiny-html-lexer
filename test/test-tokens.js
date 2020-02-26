const { chunks } = require ('../lib/tiny-lexer')
const { TokenBuilder } = require ('../lib/token-builder')
const log = console.log.bind (console)

const build = TokenBuilder.build

// test

var stream = chunks ('<span foo = "" bar><!-This is a comment->')
var r = [...build (stream)]
log (r)


var stream = chunks ('<span foo bar>bas\nbee\nbuzz<i')
var r = [...build (stream)]
log (r)



