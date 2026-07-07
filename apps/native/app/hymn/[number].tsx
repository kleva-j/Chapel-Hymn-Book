import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Pressable,
  Platform,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Surface, useThemeColor } from "heroui-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";

import { useHymnByNumber } from "../../src/utils/use-hymns";
import { useIsFavorite } from "../../src/utils/use-personalization";
import { personalizationRepository } from "../../src/data/repositories/personalization-repository";
import { shareHymn } from "../../src/utils/share-hymn";
import { useTypography } from "../../contexts/settings-context";
import { ErrorBoundary } from "../../src/components";

export default function HymnDetailScreen() {
  const params = useLocalSearchParams<{ number: string }>();
  const number = Number.parseInt(params.number ?? "0", 10);
  // Route-scoped boundary: a render throw here (e.g. bad hymn row shape,
  // typography helper regression) shows the recovery UI in this screen
  // without unmounting the drawer / stack underneath. `resetKeys` on
  // `number` clears the boundary when the user navigates to a different
  // hymn, so yesterday's failure doesn't sticky-mask a fresh route.
  return (
    <ErrorBoundary label="Hymn detail" resetKeys={[number]}>
      <HymnDetailInner number={number} />
    </ErrorBoundary>
  );
}

function HymnDetailInner({ number }: { number: number }) {
  const { data: hymn, isLoading, error } = useHymnByNumber(number);
  const { value: isFavorite } = useIsFavorite(hymn?.id ?? 0);
  const typography = useTypography();
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor("foreground");

  const handleToggleFavorite = useCallback(async () => {
    if (!hymn) return;
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await personalizationRepository.toggleFavorite(hymn.id);
  }, [hymn?.id]);

  const handleShare = useCallback(() => {
    if (!hymn) return;
    if (Platform.OS === "ios") Haptics.selectionAsync();
    void shareHymn(hymn);
  }, [hymn]);

  // Record the view once per mount for a valid hymn. onConflictDoUpdate on
  // the history table's PK bumps viewedAt on repeat views instead of growing
  // a log — see PR #15 recordView().
  useEffect(() => {
    if (!hymn) return;
    void personalizationRepository.recordView(hymn.id);
  }, [hymn?.id]);

  const handleBack = useCallback(() => {
    if (Platform.OS === "ios") {
      Haptics.selectionAsync();
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      // Deep-link or notification entry — drop the user on the hymns list,
      // not the drawer's Home index.
      router.replace("/(drawer)/(tabs)");
    }
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <Header onBack={handleBack} foreground={foreground} title="" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (error || !hymn) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <Header onBack={handleBack} foreground={foreground} title="Not found" />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-foreground text-base mb-4">
            Hymn not found.
          </Text>
          <Button onPress={handleBack} size="sm">
            <Button.Label>Go back</Button.Label>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Header
        onBack={handleBack}
        foreground={foreground}
        title={`Hymn ${hymn.number}`}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="px-5 pt-2 pb-2">
          <Text
            className="text-muted tracking-widest"
            style={{ fontSize: typography.eyebrowFontSize }}
          >
            HYMN {hymn.number}
            {hymn.language && hymn.language !== "English"
              ? `  ·  ${hymn.language.toUpperCase()}`
              : ""}
          </Text>
          <Text
            className="text-foreground font-bold mt-1 leading-tight"
            style={{
              fontSize: typography.titleFontSize,
              fontFamily: typography.fontFamily,
            }}
          >
            {hymn.title}
          </Text>
        </View>

        {hymn.chorus ? (
          <View className="px-5 mt-4">
            <Surface variant="secondary" className="p-4 rounded-lg">
              <Text
                className="text-muted uppercase tracking-wider mb-2"
                style={{ fontSize: typography.eyebrowFontSize }}
              >
                Chorus
              </Text>
              <Text
                className="text-foreground italic"
                style={{
                  fontSize: typography.bodyFontSize,
                  lineHeight: typography.bodyLineHeight,
                  fontFamily: typography.italicFontFamily,
                }}
              >
                {hymn.chorus}
              </Text>
            </Surface>
          </View>
        ) : null}

        <View className="px-5 mt-6">
          {hymn.verses.map((verse, i) => (
            <View key={i} className="mb-6 flex-row">
              <Text
                className="text-muted font-semibold w-7"
                style={{
                  fontSize: typography.bodyFontSize,
                  lineHeight: typography.bodyLineHeight,
                }}
              >
                {i + 1}.
              </Text>
              <Text
                className="text-foreground flex-1"
                style={{
                  fontSize: typography.bodyFontSize,
                  lineHeight: typography.bodyLineHeight,
                  fontFamily: typography.fontFamily,
                }}
              >
                {verse}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type HymnHeaderProps = {
  onBack: () => void;
  foreground: string;
  title: string;
  /**
   * `undefined` while the `useIsFavorite` subscription is still resolving.
   * The heart toggle is disabled during that window so a fast tap cannot
   * invert an unknown-truth state.
   */
  isFavorite?: boolean | undefined;
  onToggleFavorite?: () => void;
  onShare?: () => void;
};

function Header({
  onBack,
  foreground,
  title,
  isFavorite,
  onToggleFavorite,
  onShare,
}: HymnHeaderProps) {
  const favoriteKnown = typeof isFavorite === "boolean";
  return (
    <View className="flex-row items-center h-12 px-2 border-b border-muted/10">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back to hymn list"
        hitSlop={12}
        className="w-11 h-11 items-center justify-center active:opacity-60"
      >
        <Ionicons name="chevron-back" size={26} color={foreground} />
      </Pressable>
      <Text
        className="flex-1 text-foreground text-base font-semibold"
        numberOfLines={1}
      >
        {title}
      </Text>
      {onShare ? (
        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Share this hymn"
          hitSlop={12}
          className="w-11 h-11 items-center justify-center active:opacity-60"
        >
          <Ionicons
            name={Platform.OS === "ios" ? "share-outline" : "share-social-outline"}
            size={22}
            color={foreground}
          />
        </Pressable>
      ) : null}
      {onToggleFavorite ? (
        <Pressable
          onPress={onToggleFavorite}
          disabled={!favoriteKnown}
          accessibilityRole="button"
          accessibilityState={{
            selected: isFavorite === true,
            busy: !favoriteKnown,
            disabled: !favoriteKnown,
          }}
          accessibilityLabel={
            !favoriteKnown
              ? "Loading favorite state"
              : isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
          }
          hitSlop={12}
          className={`w-11 h-11 items-center justify-center ${
            favoriteKnown ? "active:opacity-60" : "opacity-40"
          }`}
        >
          <Ionicons
            name={isFavorite === true ? "heart" : "heart-outline"}
            size={24}
            color={foreground}
          />
        </Pressable>
      ) : (
        <View className="w-11" />
      )}
    </View>
  );
}
