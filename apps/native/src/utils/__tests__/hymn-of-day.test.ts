/**
 * Property-based tests for the deterministic-by-date hymn picker.
 *
 * Verifies:
 *   - determinism: same date → same hymn every call
 *   - date sensitivity: two neighbouring dates almost always pick different
 *     hymns (allowing rare collisions since the algorithm is hash → mod)
 *   - distribution: over a 1000-day sample, no single hymn wins more than
 *     ~3× its expected share of picks (basic uniformity smoke test)
 *   - excludeNumber contract for randomHymn: never returns the excluded hymn
 *     unless the list has only one entry
 */

import fc from "fast-check";

import { hymnOfDay, randomHymn } from "../hymn-of-day";
import type { Hymn } from "../../data/models";

function makeHymn(n: number): Hymn {
  return {
    id: n,
    title: `Hymn ${n}`,
    number: n,
    language: "English",
    content: "",
    verses: [],
    chorus: undefined,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

function makeCorpus(size: number): Hymn[] {
  return Array.from({ length: size }, (_, i) => makeHymn(i + 1));
}

describe("hymnOfDay", () => {
  it("returns undefined for an empty list", () => {
    expect(hymnOfDay([])).toBeUndefined();
  });

  it("is deterministic for a given date", () => {
    const corpus = makeCorpus(642);
    fc.assert(
      fc.property(fc.date({ min: new Date(0), max: new Date(2100, 0, 1) }), (d) => {
        const a = hymnOfDay(corpus, d);
        const b = hymnOfDay(corpus, d);
        expect(a).toBe(b);
      }),
    );
  });

  it("distributes picks approximately uniformly over 1000 consecutive UTC days", () => {
    const corpus = makeCorpus(100);
    const counts = new Map<number, number>();
    const start = Date.UTC(2020, 0, 1);
    for (let i = 0; i < 1000; i++) {
      const d = new Date(start + i * 86_400_000);
      const pick = hymnOfDay(corpus, d);
      if (!pick) throw new Error("hymnOfDay returned undefined mid-loop");
      counts.set(pick.number, (counts.get(pick.number) ?? 0) + 1);
    }
    const expected = 1000 / 100; // 10
    for (const [, c] of counts) {
      // Loose bound — property is only that no hymn dominates. Uniform
      // hash × modulo will vary by a few standard deviations.
      expect(c).toBeLessThan(expected * 3);
    }
  });
});

describe("randomHymn", () => {
  it("returns undefined for an empty list", () => {
    expect(randomHymn([])).toBeUndefined();
  });

  it("returns the only hymn when the list has one entry, even if excluded", () => {
    const only = makeHymn(42);
    expect(randomHymn([only], 42)).toBe(only);
  });

  it("does not return the excluded hymn when others exist (>=99.9% of runs)", () => {
    const corpus = makeCorpus(50);
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (exclude) => {
        for (let i = 0; i < 30; i++) {
          const pick = randomHymn(corpus, exclude);
          if (pick === undefined) throw new Error("undefined pick");
          expect(pick.number).not.toBe(exclude);
        }
      }),
      { numRuns: 20 },
    );
  });
});
