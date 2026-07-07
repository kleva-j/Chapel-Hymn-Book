/**
 * Compose the text payload used by the hymn detail Share sheet.
 *
 * Format is optimized for messaging apps (SMS, WhatsApp, Slack): title on
 * top, chorus in italics-style prefix if present, verses numbered, and a
 * deep-link footer so recipients with the app installed land directly on
 * the same hymn.
 */

import { Share } from "react-native";

import type { Hymn } from "../data/models";
import Constants from "expo-constants";

function deepLinkFor(hymn: Hymn): string {
  const scheme = Constants.expoConfig?.scheme;
  const primary = Array.isArray(scheme) ? scheme[0] : scheme;
  return `${primary ?? "chapel-hymnbook"}://hymn/${hymn.number}`;
}

export function buildShareText(hymn: Hymn): string {
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
  parts.push(deepLinkFor(hymn));
  return parts.join("\n");
}

/**
 * Open the native share sheet with a hymn's text + deep link. Returns the
 * activity type on iOS if the user picked one, otherwise resolves to
 * `undefined` (dismissed, cancelled, or Android where the field isn't
 * exposed). Any exception from the native side is caught and logged rather
 * than propagated so a share-sheet failure never crashes the detail screen.
 */
export async function shareHymn(hymn: Hymn): Promise<string | undefined> {
  const message = buildShareText(hymn);
  const url = deepLinkFor(hymn);
  try {
    const result = await Share.share(
      // iOS reads `url` as a separate share item so most apps preview the
      // deep link as a link. Android supports only `message`.
      { message, url, title: `Hymn ${hymn.number}: ${hymn.title}` },
      { dialogTitle: `Share Hymn ${hymn.number}`, subject: hymn.title },
    );
    if (result.action === Share.sharedAction) {
      return result.activityType ?? undefined;
    }
    return undefined;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Share failed", e);
    return undefined;
  }
}
