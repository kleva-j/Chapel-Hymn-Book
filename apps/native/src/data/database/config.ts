/**
 * Database configuration for the Hymn Book SQLite store.
 *
 * Schema evolution uses `PRAGMA user_version` plus the `SCHEMA_MIGRATIONS`
 * map. The runner (see `database/service.ts`) creates the base table on
 * fresh installs, then applies each migration whose key is greater than the
 * current `user_version` and writes back the new version. Bump
 * `DATABASE_CONFIG.version` when you add a new migration entry.
 */

export interface DatabaseConfig {
  readonly name: string;
  readonly version: number;
  readonly description: string;
}

export const DATABASE_CONFIG: DatabaseConfig = {
  name: "hymn_book.db",
  version: 2,
  description: "Hymn Book offline database",
};

/**
 * Base v1 schema. Applied on fresh installs only — `IF NOT EXISTS` makes it a
 * no-op for DBs that already exist. Subsequent shape changes belong in
 * `SCHEMA_MIGRATIONS` so they run on upgrade too.
 */
export const HYMNS_TABLE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS hymns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    number INTEGER UNIQUE NOT NULL,
    content TEXT NOT NULL,
    verses TEXT NOT NULL,
    chorus TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_hymns_title ON hymns(title);
  CREATE INDEX IF NOT EXISTS idx_hymns_number ON hymns(number);
  CREATE INDEX IF NOT EXISTS idx_hymns_content ON hymns(content);
`;

/**
 * Numbered migrations applied incrementally. Each value is SQL run inside a
 * transaction when the DB's `user_version` is less than the key. Add a new
 * entry + bump `DATABASE_CONFIG.version` to ship a schema change.
 */
export const SCHEMA_MIGRATIONS: ReadonlyArray<{
  version: number;
  sql: string;
}> = [
  {
    version: 2,
    sql: `
      ALTER TABLE hymns ADD COLUMN language TEXT NULL;
      CREATE INDEX IF NOT EXISTS idx_hymns_language ON hymns(language);
    `,
  },
];
