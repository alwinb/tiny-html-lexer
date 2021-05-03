
module.exports = {
  version: '1.0.0-rc',
  ...require ('./tiny-lexer'),
  ...require ('./token-builder'),
}

const { TokenBuilder, lexemes } = module.exports
module.exports.tokens = input => TokenBuilder.build (lexemes (input))
module.exports.tags = module.exports.tokens
