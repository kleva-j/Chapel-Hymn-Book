import { useCallback } from "react";
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

export default function HymnDetailScreen() {
  const params = useLocalSearchParams<{ number: string }>();
  const number = Number.parseInt(params.number ?? "0", 10);
  const { data: hymn, isLoading, error } = useHymnByNumber(number);
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor("foreground");

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
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="px-5 pt-2 pb-2">
          <Text className="text-muted text-xs tracking-widest">
            HYMN {hymn.number}
            {hymn.language && hymn.language !== "English"
              ? `  ·  ${hymn.language.toUpperCase()}`
              : ""}
          </Text>
          <Text className="text-foreground text-2xl font-bold mt-1 leading-tight">
            {hymn.title}
          </Text>
        </View>

        {hymn.chorus ? (
          <View className="px-5 mt-4">
            <Surface variant="secondary" className="p-4 rounded-lg">
              <Text className="text-muted text-xs uppercase tracking-wider mb-2">
                Chorus
              </Text>
              <Text className="text-foreground text-base italic leading-7">
                {hymn.chorus}
              </Text>
            </Surface>
          </View>
        ) : null}

        <View className="px-5 mt-6">
          {hymn.verses.map((verse, i) => (
            <View key={i} className="mb-6 flex-row">
              <Text className="text-muted text-base font-semibold w-7">
                {i + 1}.
              </Text>
              <Text className="text-foreground text-base leading-7 flex-1">
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
};

function Header({ onBack, foreground, title }: HymnHeaderProps) {
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
        className="flex-1 text-foreground text-base font-semibold pr-11"
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}
