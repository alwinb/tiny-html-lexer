
module.exports = {
  ...require ('./token-builder'),
  ...require ('./tiny-lexer')
}

const { TokenBuilder, lexemes } = module.exports
module.exports.tags = input => TokenBuilder.build (lexemes (input))

// const log = console.log.bind (console)
// log (module.exports)
