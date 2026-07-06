import { useCallback } from "react";
import {
  ActivityIndicator,
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
import { useFavorites } from "../../src/utils/use-personalization";

export default function FavoritesScreen() {
  const { data, isLoading, error } = useFavorites();
  const insets = useSafeAreaInsets();
  const muted = useThemeColor("muted");

  const keyExtractor = useCallback((h: Hymn) => String(h.id), []);
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Hymn>) => <FavoriteRow hymn={item} />,
    [],
  );

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
          Couldn't load favorites.
        </Text>
        <Text className="text-muted text-xs text-center">{error.message}</Text>
      </View>
    );
  }

  const hymns = data ?? [];

  if (hymns.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8">
        <Ionicons name="heart-outline" size={48} color={muted} />
        <Text className="text-foreground text-lg font-semibold mt-4">
          No favorites yet
        </Text>
        <Text className="text-muted text-sm mt-2 text-center">
          Tap the heart on any hymn to save it here for quick access.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={hymns}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: insets.bottom + 24,
        }}
      />
    </View>
  );
}

function Separator() {
  return <View className="h-px bg-muted/20 ml-16" />;
}

function FavoriteRow({ hymn }: { hymn: Hymn }) {
  const onPress = useCallback(() => {
    router.push({
      pathname: "/hymn/[number]",
      params: { number: hymn.number },
    });
  }, [hymn.number]);

  return (
    <Pressable
      onPress={onPress}
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
