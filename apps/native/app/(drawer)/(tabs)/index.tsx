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
import { router } from "expo-router";

import type { Hymn } from "../../../src/data/models";
import { useHymns } from "../../../src/utils/use-hymns";

/**
 * Render typed Effect.TS errors (`HymnNotFoundError`, `DatabaseConnectionError`)
 * and ordinary `Error` instances as readable strings. Plain `String(error)`
 * yields `"[object Object]"` for our `_tag`-keyed error classes.
 */
function formatError(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "_tag" in e) {
    const tag = String((e as { _tag: unknown })._tag);
    const msg =
      "message" in e ? String((e as { message: unknown }).message) : "";
    return msg ? `${tag}: ${msg}` : tag;
  }
  return typeof e === "string" ? e : JSON.stringify(e);
}

export default function HymnsScreen() {
  const { data, isLoading, error } = useHymns();
  const insets = useSafeAreaInsets();

  const keyExtractor = useCallback((h: Hymn) => String(h.id), []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Hymn>) => <HymnRow hymn={item} />,
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
        <Text className="text-foreground text-base mb-3">
          Couldn't load hymns.
        </Text>
        <Text className="text-muted text-xs mb-4 text-center">
          {formatError(error)}
        </Text>
      </View>
    );
  }

  const hymns = data ?? [];

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Math.max(insets.top - 48, 0) }}
    >
      <FlatList
        data={hymns as Hymn[]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ListHeaderComponent={<ListHeader count={hymns.length} />}
        ListEmptyComponent={
          <View className="p-6 items-center">
            <Text className="text-muted">No hymns found.</Text>
          </View>
        }
        initialNumToRender={20}
        windowSize={10}
        removeClippedSubviews
      />
    </View>
  );
}

function ListHeader({ count }: { count: number }) {
  return (
    <View className="px-4 pt-4 pb-3">
      <Text className="text-foreground text-2xl font-semibold tracking-tight">
        Hymns
      </Text>
      <Text className="text-muted text-xs mt-0.5">{count} total</Text>
    </View>
  );
}

function Separator() {
  return <View className="h-px bg-muted/20 ml-16" />;
}

function HymnRow({ hymn }: { hymn: Hymn }) {
  const onPress = useCallback(() => {
    router.push({
      pathname: "/hymn/[number]",
      // Route params are strings in expo-router — coerce explicitly.
      params: { number: String(hymn.number) },
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
