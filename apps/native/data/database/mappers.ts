import type { Hymn } from "../models";
import type { Row } from "tinybase";

/**
 * Transforms a TinyBase Row into a Hymn model object.
 * Handles type conversions for id/number and parses the verses JSON string.
 */
export const rowToHymn = (row: Row | undefined): Hymn | undefined => {
  if (!row || Object.keys(row).length === 0) return undefined;

  let verses: string[] = [];
  if (typeof row.verses === "string") {
    try {
      verses = JSON.parse(row.verses);
      if (
        !Array.isArray(verses) ||
        !verses.every((v) => typeof v === "string")
      ) {
        console.error(`Invalid verses format for hymn ${row.id}`);
        verses = [];
      }
    } catch (e) {
      console.error(`Error parsing verses for hymn ${row.id}:`, e);
      verses = [];
    }
  }

  return {
    ...row,
    id: Number(row.id),
    number: Number(row.number),
    verses,
  } as unknown as Hymn;
};
