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
import { eq } from "drizzle-orm";
import { useEffect, useMemo, useState } from "react";

import {
  hymnRepository,
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

/**
 * Look up a hymn by its canonical `hymns.number` (the digit shown in the
 * book, stable across re-seeds). Used by the `/hymn/[number]` route so that
 * deep links like `chapel-hymnbook://hymn/47` survive dataset updates and
 * fresh installs, unlike the auto-increment `id`.
 */
export function useHymnByNumber(number: number): UseHymnResult {
  const enabled = Number.isFinite(number) && number > 0;
  // `useLiveQuery` fires unconditionally, so pass a sentinel value when
  // disabled — otherwise a NaN / malformed route param would end up in the
  // parameter bind for `eq(hymns.number, ...)` and either throw or return
  // an unpredictable row. `-1` is safe because dataset numbers start at 1.
  const lookupNumber = enabled ? number : -1;
  const result = useLiveQuery(
    db.select().from(hymns).where(eq(hymns.number, lookupNumber)).limit(1),
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

/**
 * Search against `hymns_fts` (with LIKE fallback) via the repository. Unlike
 * `useHymns()` this is not a `useLiveQuery` subscription — the search SQL is
 * built dynamically per query (number routing, FTS5 prefix tokens, fallback
 * branches) and the underlying `hymns` table is read-only after seed, so a
 * one-shot fetch per query change is sufficient.
 *
 * Callers using React 19's `useDeferredValue` on the input string keep
 * typing snappy: the deferred value drives this hook, and React de-prioritizes
 * the result re-render until the user pauses.
 */
export function useHymnSearch(query: string): UseHymnsResult {
  const trimmed = query.trim();
  const [state, setState] = useState<{
    data: ReadonlyArray<Hymn> | undefined;
    error: Error | undefined;
  }>({ data: trimmed ? undefined : [], error: undefined });

  useEffect(() => {
    if (!trimmed) {
      setState({ data: [], error: undefined });
      return;
    }
    let cancelled = false;
    // Reset to `undefined` (not the previous query's rows) so the caller's
    // `isLoading` derivation stays true while the new query is in flight —
    // otherwise the UI briefly shows stale results with `isLoading === false`.
    setState({ data: undefined, error: undefined });
    hymnRepository
      .searchHymns(trimmed)
      .then((rows) => {
        if (!cancelled) setState({ data: rows, error: undefined });
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setState({
            data: [],
            error: e instanceof Error ? e : new Error(String(e)),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  return {
    data: state.data,
    isLoading: trimmed.length > 0 && state.data === undefined,
    error: state.error,
  };
}
