// TODO (FIXME): Update typescript annotations
// (Internals changed, now using generator function)
// Postponing till I have decided on a nice API. 

declare module 'tiny-html-lexer' {

  type TokenType
    = 'attributeName'
    | 'attributeAssign'
    | 'attributeValueStart'
    | 'attributeValueData'
    | 'attributeValueEnd'
    | 'tagSpace'
    | 'commentStart'
    | 'commentStartBogus'
    | 'commentData'
    | 'commentEnd'
    | 'commentEndBogus'
    | 'startTagStart'
    | 'endTagStart'
    | 'tagEnd'
    | 'tagEndClose'
    | 'charRefDecimal'
    | 'charRefHex'
    | 'charRefNamed'
    | 'unescaped'
    | 'data'
    | 'rcdata'
    | 'rawtext'
    | 'plaintext'

  type Token = [TokenType, string]

  class TokenStream implements IterableIterator<Token> {
    value: Token | null
    done: boolean
    next: () => IteratorResult<Token>
    [Symbol.iterator]: () => TokenStream
    state: PrivateState
  }

  type ContentType
    = 'data'
    | 'rcdata'
    | 'rawtext'
    | 'unquoted'
    | 'doubleQuoted'
    | 'singleQuoted'

  class PrivateState {
    content: ContentType
    context: ContentType
    tagName: string
    position: number
  }

  export function chunks (input: string): TokenStream

}