import { createMergeableStore } from "tinybase/mergeable-store";
import { useCreateMergeableStore } from "tinybase/ui-react";
import { seedHymns } from "./seed-data";

/**
 * Database configuration for Tinybase
 */
const TABLE_NAME = "hymns";
const TEXT_CELL = "text";

const createStore = () => {
  return useCreateMergeableStore(() =>
    createMergeableStore()
      .setTables({
        hymns: Object.fromEntries(
          seedHymns.map((hymn) => [
            String(hymn.id),
            {
              id: String(hymn.id),
              title: hymn.title,
              number: hymn.number,
              content: hymn.content,
              verses: JSON.stringify(hymn.verses),
              chorus: hymn.chorus ?? "",
            },
          ]),
        ),
      }),
  );
};

export { TABLE_NAME, TEXT_CELL, createStore };
