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
};

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
