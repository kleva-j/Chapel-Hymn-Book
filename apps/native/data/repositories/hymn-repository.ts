/**
 * Repository interface for hymn data operations using Effect.TS
 */

import type { Effect } from "effect";
import type {
  DatabaseConnectionError,
  SearchCriteria,
  DatabaseError,
  Hymn,
} from "@/data/models";

export interface HymnRepository {
  // Get all hymns
  readonly getAllHymns: Effect.Effect<ReadonlyArray<Hymn>, DatabaseError>;

  // Get hymn by ID
  readonly getHymnById: (id: number) => Effect.Effect<Hymn, DatabaseError>;

  // Search hymns
  readonly searchHymns: (
    criteria: SearchCriteria,
  ) => Effect.Effect<ReadonlyArray<Hymn>, DatabaseError>;

  // Initialize database
  readonly initializeDatabase: Effect.Effect<void, DatabaseConnectionError>;
}
