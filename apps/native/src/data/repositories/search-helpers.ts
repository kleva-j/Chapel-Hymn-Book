/**
 * Pure string helpers used by the repository layer's search paths.
 *
 * Kept separate from `hymn-repository-sqlite.ts` so unit tests can import
 * them without pulling in the Drizzle database service (which requires the
 * expo-sqlite native module and can't load in a plain-node jest runtime).
 */

/**
 * Escape SQL `LIKE` wildcards in user input. Without this, a query of `%`
 * or `_` matches everything / any single character instead of those literal
 * characters. Used together with an `ESCAPE '\'` clause on the SQL side.
 */
export function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Build an FTS5 query string from raw user input.
 *
 * Splits on whitespace, then strips every character that is not a Unicode
 * letter or number (`\p{L}\p{N}`). This drops `/ + = '` and other punctuation
 * that would trip the FTS5 parser with `fts5: syntax error near ...` while
 * preserving accented Latin (é, ô) and non-Latin word characters.
 *
 * `.normalize("NFKC")` unifies compatibility variants (e.g. full-width
 * digits) so token detection matches how the tokenizer indexed them.
 *
 * Returns an empty string if nothing parseable survives — caller should fall
 * back to LIKE in that case.
 */
export function buildFtsQuery(input: string): string {
  const tokens = input
    .split(/\s+/)
    .map((t) => t.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, ""))
    .filter((t) => t.length > 0)
    .map((t) => `${t}*`);
  return tokens.join(" ");
}
