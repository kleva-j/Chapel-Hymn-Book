/**
 * Concrete HymnPrograms wired to the SQLite repository.
 */

import { Effect, pipe } from "effect";

import { hymnRepository } from "../data/repositories/hymn-repository-sqlite";
import type { HymnPrograms } from "./hymn-programs";

/**
 * Every read program first sequences `initializeDatabase` so direct-entry
 * flows (deep links, refresh-on-cold-start, push notifications) never race
 * an unopened SQLite handle. `initializeDatabase` is memoized internally so
 * the chain is a no-op after first run.
 */
export const hymnPrograms: HymnPrograms = {
  loadHymn: (id) =>
    pipe(
      hymnRepository.initializeDatabase,
      Effect.flatMap(() => hymnRepository.getHymnById(id)),
    ),

  searchHymns: (query) =>
    pipe(
      hymnRepository.initializeDatabase,
      Effect.flatMap(() =>
        hymnRepository.searchHymns({ query, searchType: "title" }),
      ),
    ),

  initializeApp: pipe(
    hymnRepository.initializeDatabase,
    Effect.flatMap(() => hymnRepository.getAllHymns),
  ),
};
