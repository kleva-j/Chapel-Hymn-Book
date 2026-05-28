/**
 * SQLite-backed implementation of the HymnRepository interface.
 *
 * Each method returns an Effect that resolves a Hymn / Hymn[] or fails with a
 * DatabaseError variant. Row → domain mapping deserializes the JSON-encoded
 * verses array and translates snake_case columns to camelCase fields.
 */

import { Effect } from "effect";

import { db, initializeDatabase } from "../database/service";
import {
  DatabaseConnectionError,
  HymnNotFoundError,
  type DatabaseError,
  type Hymn,
  type SearchCriteria,
} from "../models";
import type { HymnRepository } from "./hymn-repository";

type HymnRow = {
  id: number;
  title: string;
  number: number;
  language: string | null;
  content: string;
  verses: string;
  chorus: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * SQLite stores `CURRENT_TIMESTAMP` as the literal text
 * `YYYY-MM-DD HH:MM:SS` in UTC. That format is not part of the ECMAScript
 * Date Time String spec, so `new Date(s)` parses inconsistently across
 * engines (Hermes / JSC / V8 disagree on edge cases). Convert to the
 * canonical ISO-8601 form before constructing the Date.
 */
function sqliteTimestampToIsoUtc(s: string): string {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)
    ? `${s.replace(" ", "T")}Z`
    : s;
}

/**
 * Escape SQL `LIKE` wildcards in user input. Without this, a query of `%`
 * or `_` matches everything / any single character instead of those
 * literal characters. The wrapping SQL must declare the same escape char
 * via `ESCAPE '\\'`.
 */
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function mapRowToHymn(row: HymnRow): Hymn {
  let verses: string[] = [];
  try {
    const parsed = JSON.parse(row.verses);
    if (Array.isArray(parsed)) verses = parsed.filter((v) => typeof v === "string");
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
    createdAt: new Date(sqliteTimestampToIsoUtc(row.created_at)),
    updatedAt: new Date(sqliteTimestampToIsoUtc(row.updated_at)),
  };
}

function toDbError(e: unknown): DatabaseError {
  if (e instanceof HymnNotFoundError) return e;
  return new DatabaseConnectionError(String(e));
}

export class SqliteHymnRepository implements HymnRepository {
  readonly getAllHymns: Effect.Effect<ReadonlyArray<Hymn>, DatabaseError> =
    Effect.tryPromise({
      try: async () => {
        const rows = await db.getAllAsync<HymnRow>(
          "SELECT * FROM hymns ORDER BY number ASC",
        );
        return rows.map(mapRowToHymn);
      },
      catch: toDbError,
    });

  readonly getHymnById = (id: number): Effect.Effect<Hymn, DatabaseError> =>
    Effect.tryPromise({
      try: async () => {
        const row = await db.getFirstAsync<HymnRow>(
          "SELECT * FROM hymns WHERE id = ?",
          [id],
        );
        if (!row) throw new HymnNotFoundError(id);
        return mapRowToHymn(row);
      },
      catch: toDbError,
    });

  readonly searchHymns = (
    criteria: SearchCriteria,
  ): Effect.Effect<ReadonlyArray<Hymn>, DatabaseError> =>
    Effect.tryPromise({
      try: async () => {
        const query = criteria.query.trim();
        if (!query) return [];

        let sql: string;
        let params: (string | number)[];
        switch (criteria.searchType) {
          case "number": {
            // Exact match only — reject partially-numeric input such as
            // "12abc" that `parseInt` would otherwise silently truncate.
            if (!/^\d+$/.test(query)) return [];
            const n = Number.parseInt(query, 10);
            if (!Number.isFinite(n)) return [];
            sql = "SELECT * FROM hymns WHERE number = ? ORDER BY number";
            params = [n];
            break;
          }
          case "content":
            sql =
              "SELECT * FROM hymns WHERE content LIKE ? ESCAPE '\\' ORDER BY number LIMIT 100";
            params = [`%${escapeLike(query)}%`];
            break;
          case "language":
            sql =
              "SELECT * FROM hymns WHERE language = ? COLLATE NOCASE ORDER BY number";
            params = [query];
            break;
          case "title":
          default:
            sql =
              "SELECT * FROM hymns WHERE title LIKE ? ESCAPE '\\' ORDER BY number LIMIT 100";
            params = [`%${escapeLike(query)}%`];
            break;
        }
        const rows = await db.getAllAsync<HymnRow>(sql, params);
        return rows.map(mapRowToHymn);
      },
      catch: toDbError,
    });

  readonly initializeDatabase: Effect.Effect<void, DatabaseConnectionError> =
    Effect.tryPromise({
      try: () => initializeDatabase(),
      catch: (e) => new DatabaseConnectionError(String(e)),
    });
}

export const hymnRepository: HymnRepository = new SqliteHymnRepository();
