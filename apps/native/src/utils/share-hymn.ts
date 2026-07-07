/**
 * Native Share sheet wiring. Delegates the text payload to `share-text.ts`
 * (which is unit-tested) and only handles the RN Share side effects here.
 */

import { Share } from "react-native";
import Constants from "expo-constants";

import type { Hymn } from "../data/models";
import {
  DEFAULT_LINK_SCHEME,
  buildShareText,
  deepLinkFor,
} from "./share-text";

function resolveScheme(): string {
  const scheme = Constants.expoConfig?.scheme;
  const primary = Array.isArray(scheme) ? scheme[0] : scheme;
  return primary ?? DEFAULT_LINK_SCHEME;
}

/**
 * Open the native share sheet with a hymn's text + deep link. Returns the
 * activity type on iOS if the user picked one, otherwise resolves to
 * `undefined` (dismissed, cancelled, or Android where the field isn't
 * exposed). Any exception from the native side is caught and logged rather
 * than propagated so a share-sheet failure never crashes the detail screen.
 */
export async function shareHymn(hymn: Hymn): Promise<string | undefined> {
  const scheme = resolveScheme();
  const message = buildShareText(hymn, scheme);
  const url = deepLinkFor(hymn, scheme);
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

// Re-export the pure helpers so existing utils-barrel consumers can still
// reach `buildShareText` from `../utils/share-hymn`.
export { buildShareText, deepLinkFor, DEFAULT_LINK_SCHEME };
