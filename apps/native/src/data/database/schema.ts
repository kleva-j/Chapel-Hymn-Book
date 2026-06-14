/**
 * Drizzle ORM schema definitions for the Hymn Book SQLite store.
 *
 * Each table here is the single source of truth for column shape. Migrations
 * are generated from this file via `pnpm db:generate` and emitted into
 * `apps/native/drizzle/`. Add new tables / columns here, then run the script
 * to produce the next migration SQL.
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
