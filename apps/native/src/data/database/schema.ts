/**
 * Drizzle ORM schema definitions for the Hymn Book SQLite store.
 *
 * Each table here is the single source of truth for column shape. Migrations
 * are generated from this file via `pnpm db:generate` and emitted into
 * `apps/native/drizzle/`. Add new tables / columns here, then run the script
 * to produce the next migration SQL.
 *
 * IMPORTANT — manual migrations:
 *   `0001_search_fts.sql` provisions a SQLite **FTS5 virtual table** named
 *   `hymns_fts` plus three sync triggers. Drizzle-kit cannot model virtual
 *   tables, so that migration is hand-authored and its journal entry was
 *   added manually. If you re-run `pnpm db:generate`, double-check that the
 *   journal still includes the FTS5 entry and that `migrations.js` still
 *   imports `0001_search_fts.sql`. See `apps/native/drizzle/0001_search_fts.sql`.
 */

import { sql } from "drizzle-orm";
import {
  uniqueIndex,
  sqliteTable,
  integer,
  index,
  text,
} from "drizzle-orm/sqlite-core";

export const hymns = sqliteTable(
  "hymns",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    number: integer("number").notNull(),
    language: text("language"),
    content: text("content").notNull(),
    // JSON-encoded string[] — parsed at the repository boundary.
    verses: text("verses").notNull(),
    chorus: text("chorus"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    numberUnique: uniqueIndex("idx_hymns_number").on(t.number),
    titleIdx: index("idx_hymns_title").on(t.title),
    contentIdx: index("idx_hymns_content").on(t.content),
    languageIdx: index("idx_hymns_language").on(t.language),
  }),
);

export type HymnRow = typeof hymns.$inferSelect;
export type HymnInsert = typeof hymns.$inferInsert;

/**
 * User-marked hymns. `hymnId` is the primary key so `favorite/unfavorite` is
 * an INSERT / DELETE without a separate unique-index — a hymn is either in
 * the set or it is not. Foreign key to `hymns(id)` with ON DELETE CASCADE
 * cleans the table if a hymn ever gets removed by a dataset re-seed.
 */
export const favorites = sqliteTable(
  "favorites",
  {
    hymnId: integer("hymn_id")
      .primaryKey()
      .references(() => hymns.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    createdAtIdx: index("idx_favorites_created_at").on(t.createdAt),
  }),
);

export type FavoriteRow = typeof favorites.$inferSelect;
export type FavoriteInsert = typeof favorites.$inferInsert;

/**
 * Recently viewed hymns. Primary key on `hymnId` means a repeat view UPSERTs
 * the row (bump `viewedAt`) rather than growing a log — history stays a
 * single row per hymn, sorted by most recent. `idx_history_viewed_at` keeps
 * the "10 most recent" query O(log n).
 */
export const history = sqliteTable(
  "history",
  {
    hymnId: integer("hymn_id")
      .primaryKey()
      .references(() => hymns.id, { onDelete: "cascade" }),
    viewedAt: text("viewed_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    viewedAtIdx: index("idx_history_viewed_at").on(t.viewedAt),
  }),
);

export type HistoryRow = typeof history.$inferSelect;
export type HistoryInsert = typeof history.$inferInsert;
