/**
 * Reactive hymn data hooks backed by Drizzle's `useLiveQuery`.
 *
 * Each hook subscribes to the underlying `hymns` table via expo-sqlite's
 * change listener and re-renders automatically when rows change. No manual
 * cache invalidation, no refetch — writes anywhere in the app propagate.
 *
 * Returned shape keeps the previous TanStack Query bridge surface so screen
 * code only needs minor adaptations:
 *   - `data` (mapped Hymn[]) replaces TanStack's `data: Hymn[]`
 *   - `isLoading` is `data === undefined` (first run before subscription)
 *   - `error` is the underlying live-query error
 */

import type { Hymn } from "../data/models";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { eq, sql } from "drizzle-orm";
import { useMemo } from "react";

import {
  escapeLike,
  mapRow,
} from "../data/repositories/hymn-repository-sqlite";
import { hymns } from "../data/database/schema";
import { db } from "../data/database/service";

export interface UseHymnsResult {
  readonly data: ReadonlyArray<Hymn> | undefined;
  readonly isLoading: boolean;
  readonly error: Error | undefined;
}

export interface UseHymnResult {
  readonly data: Hymn | undefined;
  readonly isLoading: boolean;
  readonly error: Error | undefined;
}

export function useHymns(): UseHymnsResult {
  const result = useLiveQuery(db.select().from(hymns).orderBy(hymns.number));

  const data = useMemo(
    () => (result.data ? result.data.map(mapRow) : undefined),
    [result.data],
  );

  return {
    data,
    isLoading: data === undefined,
    error: result.error,
  };
}

export function useHymn(id: number): UseHymnResult {
  const enabled = Number.isFinite(id) && id > 0;
  const result = useLiveQuery(
    db.select().from(hymns).where(eq(hymns.id, id)).limit(1),
  );

  const data = useMemo(() => {
    if (!enabled) return undefined;
    return result.data && result.data[0] ? mapRow(result.data[0]) : undefined;
  }, [enabled, result.data]);

  return {
    data,
    isLoading: enabled && result.data === undefined,
    error: result.error,
  };
}

export function useHymnSearch(query: string): UseHymnsResult {
  const trimmed = query.trim();
  // Escape user input so `%` and `_` match literally rather than acting as
  // wildcards; pair with `ESCAPE '\\'` on the SQL side.
  const pattern = `%${escapeLike(trimmed)}%`;
  const result = useLiveQuery(
    db
      .select()
      .from(hymns)
      .where(sql`${hymns.title} LIKE ${pattern} ESCAPE '\\'`)
      .orderBy(hymns.number)
      .limit(100),
  );

  const data = useMemo(() => {
    if (!trimmed) return [] as ReadonlyArray<Hymn>;
    return result.data ? result.data.map(mapRow) : undefined;
  }, [trimmed, result.data]);

  return {
    data,
    isLoading: trimmed.length > 0 && data === undefined,
    error: result.error,
  };
}
