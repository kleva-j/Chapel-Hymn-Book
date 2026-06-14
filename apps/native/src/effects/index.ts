/**
 * Effects barrel.
 *
 * Reactive read paths moved to `useLiveQuery` (see `utils/use-hymns`). The
 * Effect.TS layer now scopes to the one-shot DB initialization Effect — see
 * `initializeDatabaseEffect` in `data/repositories/hymn-repository-sqlite`.
 */

export {};
