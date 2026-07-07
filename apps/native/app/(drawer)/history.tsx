import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native";

import type { Hymn } from "../../src/data/models";
import { personalizationRepository } from "../../src/data/repositories/personalization-repository";
import { useRecentHistory } from "../../src/utils/use-personalization";

export default function HistoryScreen() {
  const { data, isLoading, error } = useRecentHistory(50);
  const insets = useSafeAreaInsets();
  const muted = useThemeColor("muted");

  const keyExtractor = useCallback((h: Hymn) => String(h.id), []);
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Hymn>) => <HistoryRow hymn={item} />,
    [],
  );

  const handleClear = useCallback(() => {
    Alert.alert(
      "Clear history?",
      "This removes every hymn from your recently viewed list. Favorites are not affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            personalizationRepository
              .clearHistory()
              .catch((e: unknown) => {
                // Surface the failure so the user knows the tap didn't take,
                // rather than letting it dissolve into an unhandled rejection.
                Alert.alert(
                  "Couldn't clear history",
                  e instanceof Error ? e.message : String(e),
                );
              });
          },
        },
      ],
    );
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-foreground text-base mb-2">
          Couldn't load history.
        </Text>
        <Text className="text-muted text-xs text-center">{error.message}</Text>
      </View>
    );
  }

  const hymns = data ?? [];

  if (hymns.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8">
        <Ionicons name="time-outline" size={48} color={muted} />
        <Text className="text-foreground text-lg font-semibold mt-4">
          No recently viewed hymns
        </Text>
        <Text className="text-muted text-sm mt-2 text-center">
          Every hymn you open shows up here for quick access.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
        <Text className="text-muted text-xs">
          {hymns.length} recently viewed
        </Text>
        <Pressable
          onPress={handleClear}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Clear history"
          className="px-2 py-1 active:opacity-60"
        >
          <Text className="text-muted text-xs font-semibold uppercase tracking-widest">
            Clear
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={hymns as Hymn[]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}

function Separator() {
  return <View className="h-px bg-muted/20 ml-16" />;
}

function HistoryRow({ hymn }: { hymn: Hymn }) {
  const onPress = useCallback(() => {
    router.push({
      pathname: "/hymn/[number]",
      params: { number: String(hymn.number) },
    });
  }, [hymn.number]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Hymn ${hymn.number}, ${hymn.title}${
        hymn.language && hymn.language !== "English"
          ? `, ${hymn.language}`
          : ""
      }`}
      accessibilityHint="Reopens this recently viewed hymn"
      className="flex-row items-center px-4 py-3 active:bg-muted/10"
    >
      <View className="w-12">
        <Text className="text-foreground font-semibold text-base tabular-nums">
          {hymn.number}
        </Text>
      </View>
      <View className="flex-1 pr-2">
        <Text className="text-foreground text-base" numberOfLines={1}>
          {hymn.title}
        </Text>
        {hymn.language && hymn.language !== "English" ? (
          <Text className="text-muted text-xs mt-0.5">{hymn.language}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
