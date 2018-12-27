declare module "tiny-html-lexer" {
  interface TokenizeResult {
    value: [string, string];
    done: boolean;
    next: () => TokenizeResult;
    state: CustomState;
    [Symbol.iterator]: () => TokenizeResult;
  }
  export function chunks(input: string): TokenizeResult;
}
