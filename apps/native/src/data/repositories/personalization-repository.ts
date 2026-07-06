/**
 * Repository for the user's personal state — favorites and view history.
 *
 * Backing tables are single-row-per-hymn: `favorites.hymn_id` is a PK, so
 * toggling favorite status is a straight INSERT or DELETE with no separate
 * unique-index check. `history.hymn_id` is likewise a PK, so a repeated view
 * UPSERTs `viewed_at` rather than growing a log.
 *
 * All methods return plain Promises. Reactive callers subscribe via
 * `useFavorites` / `useIsFavorite` / `useRecentHistory` in `utils/use-personalization`.
 */

import { desc, eq, sql } from "drizzle-orm";

import { db } from "../database/service";
import { favorites, history, hymns } from "../database/schema";
import { mapRow as mapHymnRow } from "./hymn-repository-sqlite";
import type { Hymn } from "../models";

export const personalizationRepository = {
  async addFavorite(hymnId: number): Promise<void> {
    // Idempotent: `INSERT OR IGNORE` skips the write if the hymn is already
    // favorited rather than throwing a UNIQUE-constraint error.
    await db
      .insert(favorites)
      .values({ hymnId })
      .onConflictDoNothing()
      .run();
  },

  async removeFavorite(hymnId: number): Promise<void> {
    await db.delete(favorites).where(eq(favorites.hymnId, hymnId)).run();
  },

  async toggleFavorite(hymnId: number): Promise<boolean> {
    // Inline the mutation queries rather than delegating through `this` — a
    // caller that destructures the method (`const { toggleFavorite } =
    // personalizationRepository`) would lose the `this` binding otherwise.
    const existing = await db
      .select({ hymnId: favorites.hymnId })
      .from(favorites)
      .where(eq(favorites.hymnId, hymnId))
      .get();
    if (existing) {
      await db.delete(favorites).where(eq(favorites.hymnId, hymnId)).run();
      return false;
    }
    await db
      .insert(favorites)
      .values({ hymnId })
      .onConflictDoNothing()
      .run();
    return true;
  },

  async isFavorite(hymnId: number): Promise<boolean> {
    const row = await db
      .select({ hymnId: favorites.hymnId })
      .from(favorites)
      .where(eq(favorites.hymnId, hymnId))
      .get();
    return Boolean(row);
  },

  async getFavoriteHymns(): Promise<Hymn[]> {
    // Join through hymns so the drawer screen renders full Hymn rows in
    // most-recently-favorited order.
    const rows = await db
      .select({ hymn: hymns })
      .from(favorites)
      .innerJoin(hymns, eq(favorites.hymnId, hymns.id))
      .orderBy(desc(favorites.createdAt))
      .all();
    return rows.map((r) => mapHymnRow(r.hymn));
  },

  /**
   * Idempotent view record. Fires once per hymn-detail mount. If the hymn is
   * already in history, the row's `viewed_at` is bumped so the list stays
   * sorted by recency. Uses SQLite `ON CONFLICT DO UPDATE` so the write is a
   * single round-trip.
   */
  async recordView(hymnId: number): Promise<void> {
    await db
      .insert(history)
      .values({ hymnId })
      .onConflictDoUpdate({
        target: history.hymnId,
        set: { viewedAt: sql`CURRENT_TIMESTAMP` },
      })
      .run();
  },

  async getRecentHistory(limit = 10): Promise<Hymn[]> {
    const rows = await db
      .select({ hymn: hymns })
      .from(history)
      .innerJoin(hymns, eq(history.hymnId, hymns.id))
      .orderBy(desc(history.viewedAt))
      .limit(limit)
      .all();
    return rows.map((r) => mapHymnRow(r.hymn));
  },

  async clearHistory(): Promise<void> {
    await db.delete(history).run();
  },
};
