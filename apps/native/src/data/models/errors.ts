/**
 * Effect.TS error types for the Hymn Book application
 */

export class DatabaseConnectionError {
  readonly _tag = "DatabaseConnectionError";
  constructor(readonly message: string) {}
}

export class EmptyResultError {
  readonly _tag = "EmptyResultError";
  constructor(readonly query: string) {}
}

export class HymnNotFoundError {
  readonly _tag = "HymnNotFoundError";
  constructor(readonly id: number) {}
}

export type DatabaseError =
  | DatabaseConnectionError
  | EmptyResultError
  | HymnNotFoundError;
