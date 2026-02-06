import { Hymn } from "@/data/models";
import { z } from "zod";
import { Effect } from "effect";

import {
  localStorageCollectionOptions,
  createCollection,
} from "@tanstack/react-db";

import { seedHymns } from "./seed-data";

/**
 * Zod schema for hymn validation
 * Defines the structure for hymns stored in the database
 */
const HymnZodSchema = z.object({
  id: z.number(),
  title: z.string(),
  number: z.number(),
  content: z.string(),
  verses: z.array(z.string()).readonly(),
  chorus: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Hymns collection with TanStack DB
 * Configured with localStorage persistence and indexed fields for efficient searching
 */
export const HymnsCollection = createCollection(
  localStorageCollectionOptions({
    id: "hymns",
    storageKey: "chapel-hymn",
    getKey: (hymn: Hymn) => hymn.id,
    schema: HymnZodSchema,
  }),
);

/**
 * Functional initialization of the hymns store using Effect.
 * Checks if the store is empty and seeds it with initial data if necessary.
 * Provides robust error handling and structured logging.
 */
export const initializeStore = () =>
  Effect.gen(function* () {
    const size = yield* Effect.try({
      try: () => HymnsCollection.utils.getStorageSize(),
      catch: (error) => new Error(`Storage error: ${error}`),
    });

    if (size === 0) {
      yield* Effect.logInfo("Hymn store is empty. Seeding initial data...");

      yield* Effect.try({
        try: () => HymnsCollection.insert(seedHymns),
        catch: (error) => new Error(`Seeding error: ${error}`),
      });

      yield* Effect.logInfo(`Successfully seeded ${seedHymns.length} hymns.`);
    } else {
      yield* Effect.logInfo(`Hymn store already contains ${size} items.`);
    }
  }).pipe(
    Effect.catchAll((error: Error) =>
      Effect.logError(`Failed to initialize hymn store: ${error.message}`),
    ),
    Effect.runPromise,
  );
