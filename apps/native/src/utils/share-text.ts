/**
 * Pure hymn → share-sheet payload builder.
 *
 * No `react-native` or `expo-*` imports so the helper is safe to load in a
 * plain-node jest runtime for property tests. The real Share API wiring
 * lives in `share-hymn.ts` and passes the resolved scheme in.
 */

import type { Hymn } from "../data/models";

export const DEFAULT_LINK_SCHEME = "chapel-hymnbook";

export function deepLinkFor(hymn: Hymn, scheme = DEFAULT_LINK_SCHEME): string {
  return `${scheme}://hymn/${hymn.number}`;
}

export function buildShareText(
  hymn: Hymn,
  scheme = DEFAULT_LINK_SCHEME,
): string {
  const parts: string[] = [];
  parts.push(`Hymn ${hymn.number}: ${hymn.title}`);
  if (hymn.language && hymn.language !== "English") {
    parts.push(`Language: ${hymn.language}`);
  }
  parts.push("");
  if (hymn.chorus) {
    parts.push("Chorus");
    parts.push(hymn.chorus);
    parts.push("");
  }
  hymn.verses.forEach((verse, i) => {
    parts.push(`${i + 1}. ${verse}`);
    parts.push("");
  });
  parts.push("— Chapel Hymnbook");
  parts.push(deepLinkFor(hymn, scheme));
  return parts.join("\n");
}
