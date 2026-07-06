/**
 * Deterministic-by-date hymn picker for the Home screen.
 *
 * The pick is a pure function of the **UTC** date string `YYYY-MM-DD` via an
 * FNV-1a hash → index modulo the hymn count. The same hymn is shown worldwide
 * on a given UTC calendar day; the pick advances at 00:00 UTC (not local
 * midnight) and is stable across app restarts within that day with no storage.
 *
 * Personalized / locale-aware picks land in a later phase once user settings
 * expose a "prefer local calendar day" toggle.
 */

import type { Hymn } from "../data/models";

function fnv1a(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // `Math.imul` keeps the multiply in 32-bit space so the hash stays
    // identical across JS engines (Hermes vs JSC vs V8).
    h = Math.imul(h, 16777619);
  }
  return h;
}

function dateKey(date: Date): string {
  // ISO string is UTC — see the module docstring.
  return date.toISOString().slice(0, 10);
}

export function hymnOfDay(
  hymns: ReadonlyArray<Hymn>,
  date: Date = new Date(),
): Hymn | undefined {
  if (hymns.length === 0) return undefined;
  // `>>> 0` coerces the signed 32-bit hash to unsigned so the modulo
  // distribution stays uniform (Math.abs on INT32_MIN wraps back to a
  // negative value and biases the result).
  const idx = (fnv1a(dateKey(date)) >>> 0) % hymns.length;
  return hymns[idx];
}

/**
 * Non-deterministic pick — used by the "Random hymn" quick action. Callers
 * can pass `excludeNumber` to avoid landing on the current featured hymn
 * (or any other hymn already surfaced elsewhere on the screen). Retries up
 * to a few times before giving up and returning the excluded hymn — with a
 * 642-hymn dataset the probability of five collisions in a row is < 1e-13.
 */
export function randomHymn(
  hymns: ReadonlyArray<Hymn>,
  excludeNumber?: number,
): Hymn | undefined {
  if (hymns.length === 0) return undefined;
  if (hymns.length === 1) return hymns[0];
  for (let attempt = 0; attempt < 5; attempt++) {
    const pick = hymns[Math.floor(Math.random() * hymns.length)];
    if (excludeNumber === undefined || pick.number !== excludeNumber) {
      return pick;
    }
  }
  // Extremely unlikely fall-through — accept the collision rather than loop.
  return hymns[Math.floor(Math.random() * hymns.length)];
}
