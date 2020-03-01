const tinyhtml = require ('../lib')
const log = console.log.bind (console)

var sample = '<span>Hello, world</span>'
var stream = tinyhtml.chunks (sample)

log (stream.state)
for (let chunk of stream) {
  log (chunk)
  log (stream.state)
}


var stream = tinyhtml.TokenBuilder.build (tinyhtml.chunks (sample))
log (stream)
for (let token of stream) {
  log (token)
  log (stream)
}
