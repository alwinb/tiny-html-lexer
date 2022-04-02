const log = console.log.bind (console)
import { lexemes, chunks, tokenTypes } from './tiny-lexer.js'
import { StartTag, EndTag, Whitespace, Comment, TokenBuilder, parseNamedCharRef, _build } from './token-builder.js'

const version = '1.0.0-rc.3'

const tags = tokens
const parseNamed = parseNamedCharRef

function tokens (input, { parseNamedCharRef = parseNamed } = { }) {
  const lexer = chunks (input)
  const builder = new TokenBuilder ({ parseNamedCharRef })
  return Object.defineProperty (_build (lexer, builder), 'state', { get: () => lexer.state })
}

export {
  version,
  tokenTypes, chunks, lexemes, tags, tokens,
  StartTag, EndTag, Whitespace, Comment,
  parseNamedCharRef
}