/**
 * TanStack Query hooks bridging React components to the Effect.TS programs.
 *
 * Each hook runs the corresponding Effect via Effect.runPromise — TanStack
 * Query handles caching, deduplication, and re-renders. Effect handles
 * typed errors and orchestration in the data layer.
 */

import { useQuery } from "@tanstack/react-query";
import { Effect } from "effect";

import { hymnPrograms } from "../effects/hymn-programs-impl";
import { queryKeys } from "./query-client";

// Disable retries on every hymn query: failures here are SQLite/schema
// errors or typed not-found cases, not transient network problems. The
// default 3-attempt retry burns DB work and leaves screens stuck in
// loading state longer than necessary.
const noRetry = { retry: false as const };

export function useHymns() {
  return useQuery({
    queryKey: queryKeys.hymns,
    queryFn: () => Effect.runPromise(hymnPrograms.initializeApp),
    ...noRetry,
  });
}

export function useHymn(id: number) {
  return useQuery({
    queryKey: ["hymn", id] as const,
    queryFn: () => Effect.runPromise(hymnPrograms.loadHymn(id)),
    enabled: Number.isFinite(id) && id > 0,
    ...noRetry,
  });
}

export function useHymnSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["search", trimmed] as const,
    queryFn: () => Effect.runPromise(hymnPrograms.searchHymns(trimmed)),
    enabled: trimmed.length > 0,
    ...noRetry,
  });
}
