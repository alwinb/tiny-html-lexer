const log = console.log.bind (console)

const tinyhtml = require ('../lib')
const stream = tinyhtml.chunks ('<span>Hello, world</span>')

log (stream)
for (let chunk of stream) {
  log (chunk)
  log (stream)
}