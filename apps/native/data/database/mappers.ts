import type { Hymn } from "../models";
import type { Row } from "tinybase";

/**
 * Transforms a TinyBase Row into a Hymn model object.
 * Handles type conversions for id/number and parses the verses JSON string.
 */
export const rowToHymn = (row: Row | undefined): Hymn | undefined => {
  if (!row) return undefined;

  let verses: string[] = [];
  if (typeof row.verses === "string") {
    try {
      verses = JSON.parse(row.verses);
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
