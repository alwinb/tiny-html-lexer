
window.tinyhtml = {
  ...require ('./token-builder'),
  ...require ('./tiny-lexer')
}

const { TokenBuilder, lexemes } = tinyhtml
window.tinyhtml.tags = input => TokenBuilder.build (lexemes (input))
