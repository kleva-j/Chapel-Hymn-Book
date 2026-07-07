/**
 * Snapshot-ish tests for the Share sheet text payload.
 *
 * `buildShareText` is a pure string-building helper so it's easy to lock in
 * — the format matters because messaging apps often preview the first line
 * and any regression to that shape would degrade the UX.
 */

import { buildShareText } from "../share-text";
import type { Hymn } from "../../data/models";

function base(overrides: Partial<Hymn> = {}): Hymn {
  return {
    id: 47,
    title: "Amazing Grace",
    number: 47,
    language: "English",
    content: "",
    chorus: undefined,
    verses: [
      "Amazing grace, how sweet the sound",
      "That saved a wretch like me",
    ],
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

describe("buildShareText", () => {
  it("starts with 'Hymn N: Title'", () => {
    const text = buildShareText(base());
    expect(text.split("\n")[0]).toBe("Hymn 47: Amazing Grace");
  });

  it("omits a Language line for English hymns", () => {
    const text = buildShareText(base());
    expect(text).not.toMatch(/^Language:/m);
  });

  it("adds a Language line for non-English hymns", () => {
    const text = buildShareText(base({ language: "Yoruba" }));
    expect(text).toMatch(/^Language: Yoruba$/m);
  });

  it("includes a Chorus block when present", () => {
    const text = buildShareText(base({ chorus: "Refrain lyric" }));
    expect(text).toMatch(/^Chorus$/m);
    expect(text).toContain("Refrain lyric");
  });

  it("numbers each verse", () => {
    const text = buildShareText(base());
    expect(text).toMatch(/^1\. Amazing grace/m);
    expect(text).toMatch(/^2\. That saved a wretch/m);
  });

  it("ends with a Chapel Hymnbook attribution and the deep link", () => {
    const text = buildShareText(base());
    const lines = text.split("\n");
    const attribution = lines.findIndex((l) => l === "— Chapel Hymnbook");
    expect(attribution).toBeGreaterThanOrEqual(0);
    // The deep link is on the last line and should point to the right number.
    expect(lines[lines.length - 1]).toMatch(/^[a-z-]+:\/\/hymn\/47$/);
  });
});
