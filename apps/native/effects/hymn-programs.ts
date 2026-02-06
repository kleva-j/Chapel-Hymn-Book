/**
 * Effect.TS programs interface for hymn operations
 */

import type { Hymn, DatabaseError } from "@/data/models";
import type { Effect } from "effect";

export interface HymnPrograms {
  // Load hymn with error handling
  readonly loadHymn: (id: number) => Effect.Effect<Hymn, DatabaseError>;

  // Search with debouncing
  readonly searchHymns: (
    query: string,
  ) => Effect.Effect<ReadonlyArray<Hymn>, DatabaseError>;

  // Initialize app data
  readonly initializeApp: Effect.Effect<ReadonlyArray<Hymn>, DatabaseError>;
}
