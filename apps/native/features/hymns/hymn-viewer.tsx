import type { Hymn } from "@/data/models";
import type { FC } from "react";

import { ScrollView, View, Text } from "react-native";
import { Button, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface HymnViewerProps {
  hymn: Hymn;
}

export const HymnViewer: FC<HymnViewerProps> = ({ hymn }) => {
  const themeColorForeground = useThemeColor("foreground");

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="p-5 pb-10"
    >
      <View className="flex-row items-center justify-between mb-4">
        {/* Hymn Number */}
        <Text className="text-base text-gray-500 mb-2 font-semibold">
          #{hymn.number}
        </Text>
        {/* Back Button */}
        <Button
          onPress={() => router.back()}
          className="border rounded-xl"
          variant="outline"
          size="sm"
        >
          <Ionicons
            color={themeColorForeground}
            name="chevron-back"
            size={18}
          />
          <Button.Label>Back</Button.Label>
        </Button>
      </View>

      {/* Hymn Title */}
      <Text className="text-[28px] font-bold text-gray-900 mb-4 leading-9 dark:text-white">
        {hymn.title}
      </Text>

      {/* Optional Chorus */}
      {hymn.chorus && (
        <View className="bg-gray-100 p-4 mb-4 dark:bg-black">
          <Text className="text-[14px] font-bold text-gray-500 mb-2 uppercase tracking-widest">
            Chorus
          </Text>
          <Text className="text-[18px] leading-7 text-gray-900 italic dark:text-white">
            {hymn.chorus}
          </Text>
        </View>
      )}

      {/* Verses */}
      <View className="mb-6">
        {hymn.verses.map((verse, index) => (
          <View
            key={`verse-${hymn.id}-${index}`}
            className="flex-row mb-5 items-start"
          >
            <Text className="text-base font-semibold text-gray-500 mr-3 min-w-[24px]">
              {index + 1}.
            </Text>
            <Text className="flex-1 text-[18px] leading-7 text-gray-900 dark:text-white">
              {verse}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
