
window.tinyhtml = {
  ...require ('./token-builder'),
  ...require ('./tiny-lexer')
}

const { TokenBuilder, lexemes } = tinyhtml
window.tinyhtml.tokens = input => TokenBuilder.build (lexemes (input))
window.tinyhtml.tags = window.tinyhtml.tokens
