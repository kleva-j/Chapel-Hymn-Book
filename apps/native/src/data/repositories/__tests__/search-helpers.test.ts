/**
 * Property-based tests for the repository's search-side sanitizers.
 *
 * `escapeLike` must guarantee that any character which would act as a LIKE
 * wildcard (`%`, `_`, `\`) is prefixed with a backslash so the surrounding
 * SQL's `ESCAPE '\'` clause treats it as a literal. `buildFtsQuery` must
 * only ever emit tokens that FTS5's MATCH parser accepts (letters, digits,
 * and the trailing prefix `*`), so no user input can produce
 * `SQLITE_ERROR: fts5: syntax error`.
 *
 * These are pure-string helpers; no DB or React context required.
 */

import fc from "fast-check";

import { buildFtsQuery, escapeLike } from "../search-helpers";

describe("escapeLike", () => {
  it("prefixes %, _, and \\ with a backslash and leaves other chars alone", () => {
    expect(escapeLike("100% of the")).toBe("100\\% of the");
    expect(escapeLike("a_b")).toBe("a\\_b");
    expect(escapeLike("c\\d")).toBe("c\\\\d");
    expect(escapeLike("Amazing Grace")).toBe("Amazing Grace");
  });

  it("never leaves an unescaped LIKE wildcard in the output (property)", () => {
    fc.assert(
      fc.property(fc.string(), (raw) => {
        const escaped = escapeLike(raw);
        // Walk the escaped output: every `%` or `_` MUST be preceded by an
        // odd-count backslash run. Every backslash we emit either escapes
        // itself or the next wildcard, never dangles.
        for (let i = 0; i < escaped.length; i++) {
          const c = escaped.charCodeAt(i);
          if (c === 0x25 /* % */ || c === 0x5f /* _ */) {
            let backslashes = 0;
            for (let j = i - 1; j >= 0 && escaped.charCodeAt(j) === 0x5c; j--) {
              backslashes++;
            }
            // Odd number of backslashes = escaped literal wildcard.
            expect(backslashes % 2).toBe(1);
          }
        }
      }),
    );
  });
});

describe("buildFtsQuery", () => {
  it("returns empty string for whitespace-only input", () => {
    expect(buildFtsQuery("")).toBe("");
    expect(buildFtsQuery("   ")).toBe("");
    expect(buildFtsQuery("\n\t")).toBe("");
  });

  it("suffixes every token with * for prefix matching", () => {
    expect(buildFtsQuery("amazing grace")).toBe("amazing* grace*");
  });

  it("strips punctuation and control chars from every token (property)", () => {
    fc.assert(
      fc.property(fc.string(), (raw) => {
        const query = buildFtsQuery(raw);
        if (query.length === 0) return;
        // Every space-separated token must end with `*` and contain only
        // Unicode letters, digits, plus the trailing `*`. This is a stricter
        // check than "no FTS5 syntax error" — it's the exact contract of
        // buildFtsQuery.
        const tokens = query.split(" ");
        for (const t of tokens) {
          expect(t.endsWith("*")).toBe(true);
          const body = t.slice(0, -1);
          expect(body.length).toBeGreaterThan(0);
          expect(/^[\p{L}\p{N}]+$/u.test(body)).toBe(true);
        }
      }),
    );
  });

  it("handles known-adversarial input without throwing", () => {
    // These inputs used to break the previous sanitizer; the property test
    // covers them implicitly, but keep them named so a regression is easy to
    // read in test output.
    for (const raw of [
      "/",
      "c++",
      "amen/chorus",
      "alpha=beta",
      "John's",
      "café",
      "résumé",
    ]) {
      expect(() => buildFtsQuery(raw)).not.toThrow();
    }
  });
});
