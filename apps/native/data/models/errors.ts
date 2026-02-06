/**
 * Effect.TS error types for the Hymn Book application
 */

import { Data } from "effect";

export class DatabaseConnectionError extends Data.TaggedError(
  "DatabaseConnectionError",
)<{ readonly message: string }> {}

export class HymnNotFoundError extends Data.TaggedError("HymnNotFoundError")<{
  readonly id: number;
}> {}

export class EmptyResultError extends Data.TaggedError("EmptyResultError")<{
  readonly query: string;
}> {}

export type DatabaseError =
  | DatabaseConnectionError
  | HymnNotFoundError
  | EmptyResultError;
