import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Surface, useThemeColor } from "heroui-native";
import Constants from "expo-constants";
import { Text, View } from "react-native";

import { Container } from "../components/container";
import { useHymns } from "../src/utils";

function Modal() {
  const accentForegroundColor = useThemeColor("accent-foreground");
  const { data: hymns } = useHymns();

  const version =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "dev";
  const hymnCount = hymns?.length ?? 0;
  // Derive the language count from the actual dataset so the About screen
  // stays accurate if a future `pnpm parse-hymns` run drops or adds
  // languages.
  const languageCount = hymns
    ? new Set(
        hymns
          .map((h) => h.language)
          .filter((l): l is string => typeof l === "string" && l.length > 0),
      ).size
    : 0;

  function handleClose() {
    router.back();
  }

  return (
    <Container>
      <View className="flex-1 items-center p-5 pt-8">
        <Surface variant="secondary" className="p-5 w-full max-w-sm rounded-2xl">
          <View className="items-center mb-4">
            <View className="w-12 h-12 bg-accent rounded-lg items-center justify-center mb-3">
              <Ionicons
                name="musical-notes"
                size={24}
                color={accentForegroundColor}
              />
            </View>
            <Text className="text-foreground font-semibold text-lg">
              Chapel Hymnbook
            </Text>
            <Text className="text-muted text-xs mt-1">Version {version}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-muted text-xs uppercase tracking-widest mb-1">
              Library
            </Text>
            <Text className="text-foreground text-sm">
              {hymnCount} hymns across {languageCount} languages, available
              fully offline.
            </Text>
          </View>

          <View className="mb-5">
            <Text className="text-muted text-xs uppercase tracking-widest mb-1">
              Dataset
            </Text>
            <Text className="text-foreground text-sm leading-5">
              Hymns parsed from a community-maintained chapel collection. Verse
              and chorus text remain the property of the original authors and
              publishers; this app is a reader, not a publisher.
            </Text>
          </View>

          <Button onPress={handleClose} className="w-full" size="sm">
            <Button.Label>Close</Button.Label>
          </Button>
        </Surface>
      </View>
    </Container>
  );
}

export default Modal;
