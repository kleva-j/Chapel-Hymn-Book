/**
 * Drizzle-backed hymn data access.
 *
 * The reactive surface for screens is `useLiveQuery` (see `utils/use-hymns`).
 * This module exposes a plain Promise API for one-shot reads (search,
 * deep-link resolution, future share/export features) and a `mapRow` helper
 * shared with the live-query hooks.
 *
 * Initialization is still wrapped in Effect.TS for the typed error path used
 * by callers that compose with the rest of the data layer.
 */

import { eq, sql } from "drizzle-orm";
import { Effect } from "effect";

import { db, initializeDatabase } from "../database/service";
import { hymns, type HymnRow } from "../database/schema";
import {
  DatabaseConnectionError,
  HymnNotFoundError,
  type DatabaseError,
  type Hymn,
} from "../models";

/**
 * SQLite emits `CURRENT_TIMESTAMP` as the literal text `YYYY-MM-DD HH:MM:SS`
 * in UTC. That format is not part of the ECMAScript Date Time String spec,
 * so `new Date(s)` parses inconsistently across engines (Hermes / JSC / V8
 * disagree on edge cases). Normalize to ISO-8601 before constructing.
 */
function sqliteTimestampToIsoUtc(s: string): string {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)
    ? `${s.replace(" ", "T")}Z`
    : s;
}

/**
 * Escape SQL `LIKE` wildcards in user input. Without this, a query of `%`
 * or `_` matches everything / any single character instead of those literal
 * characters. Used together with an `ESCAPE '\\'` clause on the SQL side.
 */
export function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export function mapRow(row: HymnRow): Hymn {
  let verses: string[] = [];
  try {
    const parsed = JSON.parse(row.verses);
    if (Array.isArray(parsed)) {
      verses = parsed.filter((v): v is string => typeof v === "string");
    }
  } catch {
    verses = [];
  }
  return {
    id: row.id,
    title: row.title,
    number: row.number,
    language: row.language,
    content: row.content,
    verses,
    chorus: row.chorus ?? undefined,
    createdAt: new Date(sqliteTimestampToIsoUtc(row.createdAt)),
    updatedAt: new Date(sqliteTimestampToIsoUtc(row.updatedAt)),
  };
}

export const hymnRepository = {
  async getAllHymns(): Promise<Hymn[]> {
    const rows = await db.select().from(hymns).orderBy(hymns.number).all();
    return rows.map(mapRow);
  },

  async getHymnById(id: number): Promise<Hymn> {
    const row = await db
      .select()
      .from(hymns)
      .where(eq(hymns.id, id))
      .get();
    if (!row) throw new HymnNotFoundError(id);
    return mapRow(row);
  },

  async searchByTitle(query: string): Promise<Hymn[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const pattern = `%${escapeLike(trimmed)}%`;
    const rows = await db
      .select()
      .from(hymns)
      .where(sql`${hymns.title} LIKE ${pattern} ESCAPE '\\'`)
      .orderBy(hymns.number)
      .limit(100)
      .all();
    return rows.map(mapRow);
  },

  async searchByContent(query: string): Promise<Hymn[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const pattern = `%${escapeLike(trimmed)}%`;
    const rows = await db
      .select()
      .from(hymns)
      .where(sql`${hymns.content} LIKE ${pattern} ESCAPE '\\'`)
      .orderBy(hymns.number)
      .limit(100)
      .all();
    return rows.map(mapRow);
  },

  async searchByNumber(value: number): Promise<Hymn[]> {
    if (!Number.isFinite(value)) return [];
    const rows = await db
      .select()
      .from(hymns)
      .where(eq(hymns.number, value))
      .orderBy(hymns.number)
      .all();
    return rows.map(mapRow);
  },

  async searchByLanguage(language: string): Promise<Hymn[]> {
    const trimmed = language.trim();
    if (!trimmed) return [];
    // Preserve the case-insensitive behavior of the pre-Drizzle SQL
    // (`COLLATE NOCASE`) — `searchByLanguage("yoruba")` must still match rows
    // stored as `"Yoruba"`.
    const rows = await db
      .select()
      .from(hymns)
      .where(sql`${hymns.language} = ${trimmed} COLLATE NOCASE`)
      .orderBy(hymns.number)
      .all();
    return rows.map(mapRow);
  },

  /**
   * Unified search entry point used by the in-list search bar.
   *
   *   - Digits-only input (e.g. `"47"`) → exact match on `hymns.number`.
   *   - Anything else → FTS5 query over `hymns_fts` with BM25 ranking, title
   *     boosted (10×) over content. Tokens are suffixed with `*` for prefix
   *     matching so `"amaz"` matches `"amazing"`.
   *   - If the FTS5 query returns zero rows AND the input has non-ASCII
   *     characters, falls back to a LIKE pattern against the original
   *     `hymns` table — covers tokenizer-dropped non-Latin scripts.
   *
   * Always limited to 100 results to keep render budgets predictable.
   */
  async searchHymns(query: string): Promise<Hymn[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    if (/^\d+$/.test(trimmed)) {
      const n = Number.parseInt(trimmed, 10);
      if (!Number.isFinite(n)) return [];
      return this.searchByNumber(n);
    }

    const ftsQuery = buildFtsQuery(trimmed);
    // Column aliases: `SELECT h.*` would return snake_case timestamp columns
    // (`created_at`, `updated_at`), but `HymnRow` (inferred from the Drizzle
    // schema's field names) uses camelCase. Without aliases, `mapRow` would
    // pass `undefined` to `new Date(...)` and yield `Invalid Date`.
    let ftsRows: HymnRow[] = [];
    let ftsThrew = false;
    if (ftsQuery) {
      try {
        ftsRows = await db.all<HymnRow>(sql`
          SELECT
            h.id,
            h.title,
            h.number,
            h.language,
            h.content,
            h.verses,
            h.chorus,
            h.created_at AS "createdAt",
            h.updated_at AS "updatedAt"
            FROM hymns h
            JOIN hymns_fts ON hymns_fts.rowid = h.id
           WHERE hymns_fts MATCH ${ftsQuery}
           ORDER BY bm25(hymns_fts, 10.0, 1.0)
           LIMIT 100
        `);
      } catch {
        // Any FTS5 parse error (e.g. an input with FTS5 operators the
        // sanitizer missed) falls through to LIKE below rather than
        // surfacing as an exception to the caller.
        ftsThrew = true;
      }
    }
    if (ftsRows.length > 0) return ftsRows.map(mapRow);

    // Fallback covers three cases: a malformed FTS query (only non-token
    // chars), a valid query whose tokens fell off the FTS index (some
    // non-Latin scripts after `unicode61` strips them), and any FTS5 parse
    // failure caught above. Cheap on 642 rows.
    const isNonAscii = /[^\x00-\x7F]/.test(trimmed);
    if (!isNonAscii && ftsQuery && !ftsThrew) {
      // ASCII input with a well-formed FTS query that legitimately returned
      // zero rows — LIKE would not turn up anything new.
      return [];
    }

    const pattern = `%${escapeLike(trimmed)}%`;
    const likeRows = await db
      .select()
      .from(hymns)
      .where(
        sql`${hymns.title} LIKE ${pattern} ESCAPE '\\' OR ${hymns.content} LIKE ${pattern} ESCAPE '\\'`,
      )
      .orderBy(hymns.number)
      .limit(100)
      .all();
    return likeRows.map(mapRow);
  },
};

/**
 * Build an FTS5 query string from raw user input.
 *
 * Splits on whitespace, then strips every character that is not a Unicode
 * letter or number (`\p{L}\p{N}`). This is broader than the previous
 * FTS5-operator blocklist — it also drops `/ + = '` and any other punctuation
 * that would trip the FTS5 parser with `fts5: syntax error near ...` while
 * preserving accented Latin (é, ô) and non-Latin word characters.
 *
 * `.normalize("NFKC")` unifies compatibility variants (e.g. full-width
 * digits) so token detection matches how the tokenizer indexed them.
 *
 * Returns an empty string if nothing parseable survives — caller should fall
 * back to LIKE in that case.
 */
function buildFtsQuery(input: string): string {
  const tokens = input
    .split(/\s+/)
    .map((t) => t.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, ""))
    .filter((t) => t.length > 0)
    .map((t) => `${t}*`);
  return tokens.join(" ");
}

/**
 * One-shot Effect for app initialization. Reads no longer go through Effect
 * — they use `useLiveQuery` (reactive) or the plain Promise methods above.
 */
export const initializeDatabaseEffect: Effect.Effect<
  void,
  DatabaseConnectionError
> = Effect.tryPromise({
  try: () => initializeDatabase(),
  catch: (e) => new DatabaseConnectionError(String(e)),
});

export type HymnRepository = typeof hymnRepository;

/**
 * Re-thrown for callers that surface typed errors. Use the repository methods
 * directly elsewhere — no need to wrap each read in Effect now that
 * `useLiveQuery` is the primary read surface.
 */
export function toDatabaseError(e: unknown): DatabaseError {
  if (e instanceof HymnNotFoundError) return e;
  return new DatabaseConnectionError(String(e));
}
