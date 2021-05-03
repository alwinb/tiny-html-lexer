const log = console.log.bind (console)
import { lexemes, chunks, tokenTypes } from './tiny-lexer.js'
import { StartTag, EndTag, Whitespace, Comment, TokenBuilder, parseNamedCharRef, _build } from './token-builder.js'

const version = '1.0.0-rc.2'

const tags = tokens
function tokens (input) {
  const lexer = chunks (input)
  const builder = new TokenBuilder ()
  return Object.defineProperty (_build (lexer, builder), 'state', { get: () => lexer.state })
}

export {
  version,
  tokenTypes, chunks, lexemes, tags, tokens,
  StartTag, EndTag, Whitespace, Comment,
}