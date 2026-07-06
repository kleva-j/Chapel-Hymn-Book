import { useCallback } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Surface } from "heroui-native";
import * as Haptics from "expo-haptics";

import {
  DEFAULT_SETTINGS,
  useSettings,
  useTypography,
  type FontFamily,
  type FontSize,
  type LineSpacing,
} from "../../contexts/settings-context";

export default function SettingsScreen() {
  const { settings, update, reset } = useSettings();
  const typography = useTypography();
  const insets = useSafeAreaInsets();

  const handleReset = useCallback(() => {
    Alert.alert("Reset display settings?", "Restores the defaults.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => reset() },
    ]);
  }, [reset]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="px-4 pt-4 pb-2">
        <Text className="text-muted text-xs uppercase tracking-widest">
          Display
        </Text>
      </View>

      <Section title="Font size">
        <SegmentedControl<FontSize>
          value={settings.fontSize}
          options={[
            { value: "small", label: "S" },
            { value: "medium", label: "M" },
            { value: "large", label: "L" },
            { value: "x-large", label: "XL" },
          ]}
          onChange={(v) => update({ fontSize: v })}
        />
      </Section>

      <Section title="Font family">
        <SegmentedControl<FontFamily>
          value={settings.fontFamily}
          options={[
            { value: "sans", label: "Sans" },
            { value: "serif", label: "Serif" },
          ]}
          onChange={(v) => update({ fontFamily: v })}
        />
      </Section>

      <Section title="Line spacing">
        <SegmentedControl<LineSpacing>
          value={settings.lineSpacing}
          options={[
            { value: "compact", label: "Compact" },
            { value: "comfortable", label: "Comfortable" },
          ]}
          onChange={(v) => update({ lineSpacing: v })}
        />
      </Section>

      <View className="px-4 mt-4">
        <Text className="text-muted text-xs uppercase tracking-widest mb-2">
          Preview
        </Text>
        <Surface variant="secondary" className="p-4 rounded-xl">
          <Text
            className="text-foreground"
            style={{
              fontSize: typography.bodyFontSize,
              lineHeight: typography.bodyLineHeight,
              fontFamily: typography.fontFamily,
            }}
          >
            Amazing grace, how sweet the sound{"\n"}
            That saved a wretch like me!{"\n"}
            I once was lost, but now am found;{"\n"}
            Was blind, but now I see.
          </Text>
        </Surface>
      </View>

      <View className="px-4 mt-6">
        <Pressable
          onPress={handleReset}
          accessibilityRole="button"
          className="py-3 items-center active:opacity-60"
        >
          <Text className="text-muted text-sm font-semibold uppercase tracking-widest">
            Reset to defaults ({DEFAULT_SETTINGS.fontSize})
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="px-4 mt-4">
      <Text className="text-muted text-xs uppercase tracking-widest mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}

interface Option<T extends string> {
  readonly value: T;
  readonly label: string;
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (next: T) => void;
}) {
  return (
    <View className="flex-row bg-muted/10 rounded-xl p-1">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (opt.value === value) return;
              if (Platform.OS === "ios") Haptics.selectionAsync();
              onChange(opt.value);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`flex-1 h-10 rounded-lg items-center justify-center ${
              selected ? "bg-background" : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selected ? "text-foreground" : "text-muted"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
