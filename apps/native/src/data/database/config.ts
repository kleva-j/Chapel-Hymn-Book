/**
 * Database configuration for TanStack DB with SQLite
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
