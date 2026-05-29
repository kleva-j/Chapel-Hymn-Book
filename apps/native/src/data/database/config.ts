/**
 * Database configuration for the Hymn Book SQLite store.
 *
 * Schema and migrations live with Drizzle ORM:
 *   - Schema source: `./schema.ts`
 *   - Generated SQL migrations: `apps/native/drizzle/*.sql`
 *   - Migrator: `drizzle-orm/expo-sqlite/migrator`
 *
 * Bump `version` when you add a new generated migration — this constant is
 * purely informational; the actual upgrade gate is Drizzle's
 * `__drizzle_migrations` table.
 */

export interface DatabaseConfig {
  readonly name: string;
  readonly version: number;
  readonly description: string;
}

export const DATABASE_CONFIG: DatabaseConfig = {
  name: "hymn_book.db",
  version: 1,
  description: "Hymn Book offline database",
};
