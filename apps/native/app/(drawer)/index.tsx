import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Surface, useThemeColor } from "heroui-native";
import * as Haptics from "expo-haptics";

import { Container } from "../../components/container";
import type { Hymn } from "../../src/data/models";
import {
  hymnOfDay,
  randomHymn,
  useHymns,
  useRecentHistory,
} from "../../src/utils";

export default function Home() {
  const { data: hymns, isLoading, error } = useHymns();
  const { data: recent } = useRecentHistory(1);
  const insets = useSafeAreaInsets();

  // Memoize the daily pick so the same render of the screen doesn't reshuffle
  // even if a parent re-render happens. Stays deterministic per UTC date.
  const featured = useMemo(
    () => (hymns ? hymnOfDay(hymns) : undefined),
    [hymns],
  );

  const lastViewed = recent && recent.length > 0 ? recent[0] : undefined;

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-foreground text-base mb-2">
          Couldn't load hymns.
        </Text>
        <Text className="text-muted text-xs text-center">
          {error instanceof Error ? error.message : String(error)}
        </Text>
      </View>
    );
  }

  if (isLoading || !hymns) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Container
      className="p-4"
      // `<Container>` spreads its own `style` first, so any style we pass
      // *replaces* its internal `paddingBottom: insets.bottom`. Re-include it
      // here alongside our top clamp so the FAB / bottom safe area survives.
      style={{
        paddingTop: Math.max(insets.top - 32, 0),
        paddingBottom: insets.bottom,
      }}
    >
      <View className="pt-2 pb-4">
        <Text className="text-foreground text-3xl font-semibold tracking-tight">
          Chapel Hymnbook
        </Text>
        <Text className="text-muted text-sm mt-1">
          {hymns.length} hymns offline
        </Text>
      </View>

      {featured ? <FeaturedCard hymn={featured} /> : null}

      {lastViewed && lastViewed.id !== featured?.id ? (
        <ContinueReadingCard hymn={lastViewed} />
      ) : null}

      <View className="mt-5">
        <Text className="text-muted text-xs uppercase tracking-widest mb-2">
          Quick actions
        </Text>
        <View className="flex-row flex-wrap -mx-1">
          <ActionTile
            icon="musical-notes"
            label="Browse"
            onPress={() => router.push("/(drawer)/(tabs)")}
          />
          <ActionTile
            icon="search"
            label="Search"
            onPress={() => router.push("/(drawer)/(tabs)")}
          />
          <ActionTile
            icon="shuffle"
            label="Random"
            onPress={() => {
              const pick = randomHymn(hymns, featured?.number);
              if (pick) {
                router.push({
                  pathname: "/hymn/[number]",
                  params: { number: String(pick.number) },
                });
              }
            }}
          />
          <ActionTile
            icon="information-circle-outline"
            label="About"
            onPress={() => router.push("/modal")}
          />
        </View>
      </View>
    </Container>
  );
}

function FeaturedCard({ hymn }: { hymn: Hymn }) {
  const foreground = useThemeColor("foreground");

  const preview = useMemo(() => {
    const source = hymn.chorus ?? hymn.verses[0] ?? "";
    const lines = source.split(/\n+/).slice(0, 2);
    return lines.join(" · ");
  }, [hymn]);

  const onPress = useCallback(() => {
    if (Platform.OS === "ios") Haptics.selectionAsync();
    router.push({
      pathname: "/hymn/[number]",
      params: { number: String(hymn.number) },
    });
  }, [hymn.number]);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Surface variant="secondary" className="p-5 rounded-2xl">
        <Text className="text-muted text-xs uppercase tracking-widest">
          Hymn of the Day · #{hymn.number}
          {hymn.language && hymn.language !== "English"
            ? `  ·  ${hymn.language}`
            : ""}
        </Text>
        <Text
          className="text-foreground text-xl font-bold mt-2 leading-tight"
          numberOfLines={2}
        >
          {hymn.title}
        </Text>
        {preview ? (
          <Text
            className="text-muted text-sm italic mt-3 leading-6"
            numberOfLines={2}
          >
            {preview}
          </Text>
        ) : null}
        <View className="flex-row items-center mt-4">
          <Text className="text-foreground text-sm font-semibold">
            Open hymn
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={foreground}
            style={{ marginLeft: 6 }}
          />
        </View>
      </Surface>
    </Pressable>
  );
}

function ContinueReadingCard({ hymn }: { hymn: Hymn }) {
  const foreground = useThemeColor("foreground");
  const onPress = useCallback(() => {
    if (Platform.OS === "ios") Haptics.selectionAsync();
    router.push({
      pathname: "/hymn/[number]",
      params: { number: String(hymn.number) },
    });
  }, [hymn.number]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Continue reading Hymn ${hymn.number}: ${hymn.title}`}
      className="mt-3"
    >
      <Surface variant="secondary" className="p-4 rounded-xl flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-accent items-center justify-center mr-3">
          <Ionicons name="time" size={16} color={foreground} />
        </View>
        <View className="flex-1">
          <Text className="text-muted text-xs uppercase tracking-widest">
            Continue reading
          </Text>
          <Text
            className="text-foreground text-base font-semibold mt-0.5"
            numberOfLines={1}
          >
            #{hymn.number} · {hymn.title}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={foreground} />
      </Surface>
    </Pressable>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  const foreground = useThemeColor("foreground");
  const handlePress = useCallback(() => {
    if (Platform.OS === "ios") Haptics.selectionAsync();
    onPress();
  }, [onPress]);

  return (
    <View className="basis-1/2 p-1">
      <Pressable onPress={handlePress} accessibilityRole="button">
        <Surface variant="secondary" className="p-4 rounded-xl items-start">
          <Ionicons name={icon} size={22} color={foreground} />
          <Text className="text-foreground text-base font-medium mt-2">
            {label}
          </Text>
        </Surface>
      </Pressable>
    </View>
  );
}
