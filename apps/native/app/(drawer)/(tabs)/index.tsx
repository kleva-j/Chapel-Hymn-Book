import { useCallback, useDeferredValue, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native";

import { HighlightedText } from "../../../src/components";
import type { Hymn } from "../../../src/data/models";
import { useHymnSearch, useHymns } from "../../../src/utils/use-hymns";

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
  const { data: allHymns, isLoading, error } = useHymns();
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor("foreground");
  const muted = useThemeColor("muted");

  // Local input drives the search; `useDeferredValue` lets React keep typing
  // snappy while re-rendering search results at lower priority. No timer or
  // debounce hook needed — React handles the prioritization.
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useHymnSearch(deferredQuery);

  const keyExtractor = useCallback((h: Hymn) => String(h.id), []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Hymn>) => (
      <HymnRow hymn={item} query={deferredQuery} />
    ),
    [deferredQuery],
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

  // While a search is in flight, keep `list` empty; the `ListEmptyComponent`
  // below distinguishes "loading" from "no matches" so the user does not see
  // a false "0 matches" mid-query.
  const list = deferredQuery
    ? (searchResults ?? [])
    : (allHymns ?? []);
  const showSearchLoading = deferredQuery.length > 0 && searchLoading;

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Math.max(insets.top - 48, 0) }}
    >
      <View className="px-4 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-semibold tracking-tight">
          Hymns
        </Text>
        <Text className="text-muted text-xs mt-0.5">
          {showSearchLoading
            ? "Searching…"
            : deferredQuery
              ? `${list.length} match${list.length === 1 ? "" : "es"}`
              : `${list.length} total`}
        </Text>

        <View className="mt-3 flex-row items-center bg-muted/10 rounded-xl px-3 h-11">
          <Ionicons name="search" size={18} color={muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by number, title, or lyric"
            placeholderTextColor={muted}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            className="flex-1 ml-2 text-foreground text-base"
            style={{ color: foreground }}
            accessibilityLabel="Search hymns"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={12}
            >
              <Ionicons name="close-circle" size={18} color={muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={list as Hymn[]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={
          <View className="p-6 items-center">
            {showSearchLoading ? (
              <ActivityIndicator />
            ) : searchError ? (
              <>
                <Text className="text-foreground text-base mb-1">
                  Search failed.
                </Text>
                <Text className="text-muted text-xs text-center">
                  {formatError(searchError)}
                </Text>
              </>
            ) : (
              <Text className="text-muted">
                {deferredQuery
                  ? `No hymns match "${deferredQuery}".`
                  : "No hymns found."}
              </Text>
            )}
          </View>
        }
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        initialNumToRender={20}
        windowSize={10}
        removeClippedSubviews
      />
    </View>
  );
}

function Separator() {
  return <View className="h-px bg-muted/20 ml-16" />;
}

function HymnRow({ hymn, query }: { hymn: Hymn; query: string }) {
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
        <HighlightedText
          text={hymn.title}
          query={query}
          numberOfLines={1}
          className="text-foreground text-base"
          highlightClassName="text-foreground text-base font-bold"
        />
        {hymn.language && hymn.language !== "English" ? (
          <Text className="text-muted text-xs mt-0.5">{hymn.language}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
