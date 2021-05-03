
module.exports = {
  ...require ('./token-builder'),
  ...require ('./tiny-lexer')
}

const { TokenBuilder, lexemes } = module.exports
module.exports.tokens = input => TokenBuilder.build (lexemes (input))
module.exports.tags = module.exports.tokens

// const log = console.log.bind (console)
// log (module.exports)
