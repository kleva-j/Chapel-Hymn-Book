import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * User-tunable reading preferences applied to hymn detail typography.
 *
 * Persisted to `expo-secure-store` (available on iOS + Android; falls back
 * to a JS-only implementation on web). The initial render uses `DEFAULT_SETTINGS`
 * so consumers do not have to handle a "loading settings" state — the
 * hydrated values swap in once SecureStore resolves.
 */

export type FontSize = "small" | "medium" | "large" | "x-large";
export type FontFamily = "sans" | "serif";
export type LineSpacing = "compact" | "comfortable";

export interface HymnBookSettings {
  readonly fontSize: FontSize;
  readonly fontFamily: FontFamily;
  readonly lineSpacing: LineSpacing;
}

export const DEFAULT_SETTINGS: HymnBookSettings = {
  fontSize: "medium",
  fontFamily: "sans",
  lineSpacing: "comfortable",
};

const STORAGE_KEY = "hymnbook.settings.v1";

interface SettingsContextValue {
  readonly settings: HymnBookSettings;
  readonly update: (partial: Partial<HymnBookSettings>) => void;
  readonly reset: () => void;
  readonly hydrated: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

function isValidSettings(value: unknown): value is HymnBookSettings {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (v.fontSize === "small" ||
      v.fontSize === "medium" ||
      v.fontSize === "large" ||
      v.fontSize === "x-large") &&
    (v.fontFamily === "sans" || v.fontFamily === "serif") &&
    (v.lineSpacing === "compact" || v.lineSpacing === "comfortable")
  );
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<HymnBookSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  // Track whether the user has changed settings before hydration resolves.
  // If they have, we discard the persisted blob — respecting the newer
  // in-memory intent rather than clobbering it with stale disk state.
  const userTouchedBeforeHydrate = useRef(false);

  useEffect(() => {
    let cancelled = false;
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (!raw || userTouchedBeforeHydrate.current) {
          setHydrated(true);
          return;
        }
        try {
          const parsed = JSON.parse(raw);
          if (isValidSettings(parsed)) setSettings(parsed);
        } catch {
          // Corrupt persisted state — fall through to defaults.
        }
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // Explicit `.catch` prevents unhandled promise rejections if the
    // secure-store backend is unavailable / full / locked. The setting is
    // already reflected in-memory; the failed write just means it won't
    // survive relaunch.
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(settings)).catch(
      () => {},
    );
  }, [settings, hydrated]);

  const markTouched = useCallback(() => {
    if (!hydrated) userTouchedBeforeHydrate.current = true;
  }, [hydrated]);

  const update = useCallback(
    (partial: Partial<HymnBookSettings>) => {
      markTouched();
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    [markTouched],
  );

  const reset = useCallback(() => {
    markTouched();
    setSettings(DEFAULT_SETTINGS);
  }, [markTouched]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, update, reset, hydrated }),
    [settings, update, reset, hydrated],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

/**
 * Resolve the raw settings into concrete typography values consumed by the
 * hymn detail screen.
 */
export interface TypographyScale {
  readonly bodyFontSize: number;
  readonly bodyLineHeight: number;
  readonly titleFontSize: number;
  readonly eyebrowFontSize: number;
  readonly fontFamily: string | undefined;
  readonly italicFontFamily: string | undefined;
}

const BODY_FONT_SIZE_BY_SIZE: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 19,
  "x-large": 22,
};

const TITLE_FONT_SIZE_BY_SIZE: Record<FontSize, number> = {
  small: 22,
  medium: 24,
  large: 28,
  "x-large": 32,
};

const LINE_HEIGHT_RATIO_BY_SPACING: Record<LineSpacing, number> = {
  compact: 1.45,
  comfortable: 1.75,
};

export function typographyFromSettings(
  settings: HymnBookSettings,
): TypographyScale {
  const bodyFontSize = BODY_FONT_SIZE_BY_SIZE[settings.fontSize];
  const bodyLineHeight = Math.round(
    bodyFontSize * LINE_HEIGHT_RATIO_BY_SPACING[settings.lineSpacing],
  );
  const titleFontSize = TITLE_FONT_SIZE_BY_SIZE[settings.fontSize];
  const eyebrowFontSize = Math.max(11, bodyFontSize - 4);
  // iOS bundles Georgia as a system serif; Android does not, so falling back
  // to the platform's generic "serif" family alias keeps the choice honored
  // instead of silently rendering the default sans face.
  const serifFamily = Platform.select<string>({
    ios: "Georgia",
    android: "serif",
    default: "serif",
  });
  const fontFamily =
    settings.fontFamily === "serif" ? serifFamily : undefined;
  const italicFontFamily =
    settings.fontFamily === "serif" ? serifFamily : undefined;
  return {
    bodyFontSize,
    bodyLineHeight,
    titleFontSize,
    eyebrowFontSize,
    fontFamily,
    italicFontFamily,
  };
}

export function useTypography(): TypographyScale {
  const { settings } = useSettings();
  return useMemo(() => typographyFromSettings(settings), [settings]);
}
