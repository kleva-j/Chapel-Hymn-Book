/**
 * Reactive hooks over the personalization tables (favorites, history).
 *
 * Each hook subscribes to its table via Drizzle's `useLiveQuery`, so writes
 * from anywhere in the app propagate to any screen consuming these hooks
 * without manual cache invalidation.
 */

import { useMemo } from "react";
import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { db } from "../data/database/service";
import { favorites, history, hymns } from "../data/database/schema";
import { mapRow } from "../data/repositories/hymn-repository-sqlite";
import type { UseHymnsResult } from "./use-hymns";

/**
 * Reactive list of the user's favorited hymns, most recently favorited first.
 */
export function useFavorites(): UseHymnsResult {
  const result = useLiveQuery(
    db
      .select({ hymn: hymns })
      .from(favorites)
      .innerJoin(hymns, eq(favorites.hymnId, hymns.id))
      .orderBy(desc(favorites.createdAt)),
  );

  const data = useMemo(
    () => (result.data ? result.data.map((r) => mapRow(r.hymn)) : undefined),
    [result.data],
  );

  return {
    data,
    isLoading: data === undefined,
    error: result.error,
  };
}

/**
 * `true` if the given hymn id is in favorites, `false` otherwise, `undefined`
 * while the subscription is still initializing. Used by the heart-toggle
 * button in the hymn detail header.
 */
export function useIsFavorite(hymnId: number): {
  readonly value: boolean | undefined;
  readonly error: Error | undefined;
} {
  const enabled = Number.isFinite(hymnId) && hymnId > 0;
  const result = useLiveQuery(
    db
      .select({ hymnId: favorites.hymnId })
      .from(favorites)
      .where(eq(favorites.hymnId, hymnId))
      .limit(1),
  );

  const value = useMemo(() => {
    if (!enabled) return false;
    if (result.data === undefined) return undefined;
    return result.data.length > 0;
  }, [enabled, result.data]);

  return { value, error: result.error };
}

/**
 * Reactive list of recently viewed hymns, most recent first.
 */
export function useRecentHistory(limit = 10): UseHymnsResult {
  const result = useLiveQuery(
    db
      .select({ hymn: hymns })
      .from(history)
      .innerJoin(hymns, eq(history.hymnId, hymns.id))
      .orderBy(desc(history.viewedAt))
      .limit(limit),
  );

  const data = useMemo(
    () => (result.data ? result.data.map((r) => mapRow(r.hymn)) : undefined),
    [result.data],
  );

  return {
    data,
    isLoading: data === undefined,
    error: result.error,
  };
}

/**
 * Reactive count of favorited hymns — used to badge the drawer entry.
 */
export function useFavoritesCount(): number {
  const result = useLiveQuery(
    db.select({ hymnId: favorites.hymnId }).from(favorites),
  );
  return result.data?.length ?? 0;
}
