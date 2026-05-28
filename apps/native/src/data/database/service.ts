/**
 * SQLite database service for the Hymn Book application.
 *
 * Singleton connection opened with expo-sqlite. Initialization
 *   1. creates the base table on fresh installs,
 *   2. applies pending schema migrations against the current `user_version`,
 *   3. seeds rows from the bundled JSON asset only when the table is empty.
 * Subsequent launches are no-ops.
 */

import * as SQLite from "expo-sqlite";

import {
  DATABASE_CONFIG,
  HYMNS_TABLE_SCHEMA,
  SCHEMA_MIGRATIONS,
} from "./config";
import hymnsSeed from "../../../assets/data/hymns.json";

type SeedHymn = {
  number: number;
  title: string;
  language: string | null;
  chorus?: string;
  verses: string[];
  content: string;
};

export const db = SQLite.openDatabaseSync(DATABASE_CONFIG.name);

let initPromise: Promise<void> | null = null;

export function initializeDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = doInitialize().catch((e) => {
      initPromise = null;
      throw e;
    });
  }
  return initPromise;
}

async function doInitialize(): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync(HYMNS_TABLE_SCHEMA);
  await applyMigrations();

  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM hymns",
  );
  if (!row || row.count === 0) {
    await seed();
  }
}

async function applyMigrations(): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = row?.user_version ?? 0;

  const pending = SCHEMA_MIGRATIONS.filter(
    (m) => m.version > currentVersion,
  ).sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      // PRAGMA cannot be parameterized; version is a trusted constant.
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
  }

  // Ensure user_version reflects the target even on fresh installs where
  // every migration ran.
  if (pending.length === 0 && currentVersion < DATABASE_CONFIG.version) {
    await db.execAsync(
      `PRAGMA user_version = ${DATABASE_CONFIG.version}`,
    );
  }
}

async function seed(): Promise<void> {
  const data = hymnsSeed as ReadonlyArray<SeedHymn>;
  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(
      `INSERT INTO hymns (title, number, language, content, verses, chorus)
       VALUES ($title, $number, $language, $content, $verses, $chorus)`,
    );
    try {
      for (const hymn of data) {
        await stmt.executeAsync({
          $title: hymn.title,
          $number: hymn.number,
          $language: hymn.language,
          $content: hymn.content,
          $verses: JSON.stringify(hymn.verses),
          $chorus: hymn.chorus ?? null,
        });
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}
