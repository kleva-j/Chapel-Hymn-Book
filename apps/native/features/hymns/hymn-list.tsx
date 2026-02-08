import type { Hymn } from "@/data/models";
import type { FC } from "react";

import { TouchableOpacity, FlatList, View, Text } from "react-native";
import { Separator } from "heroui-native";

interface HymnListProps {
  hymns: ReadonlyArray<Hymn>;
  onHymnPress: (hymn: Hymn) => void;
}

export const HymnList: FC<HymnListProps> = ({ hymns, onHymnPress }) => {
  // Display "no results" message when array is empty
  if (hymns.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-10">
        <Text className="text-xl font-semibold text-gray-500 mb-2">
          No hymns found
        </Text>
        <Text className="text-sm text-gray-400 text-center mb-10">
          Try adjusting your search criteria
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={hymns as Hymn[]}
      renderItem={({ item }: { item: Hymn }) => (
        <TouchableOpacity
          className="flex-row items-center py-2 px-3 bg-gray-100 dark:bg-black"
          onPress={() => onHymnPress(item)}
          activeOpacity={0.7}
        >
          <View className="w-fit h-10 rounded-full bg-gray-100 dark:bg-black justify-center items-center mr-4">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              # {item.number}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-semibold text-gray-900 dark:text-white leading-[22px]"
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </View>
          <View className="ml-3">
            <Text className="text-[28px] text-gray-300 font-light">›</Text>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={() => (
        <Separator
          orientation="horizontal"
          className="h-px bg-gray-200 dark:bg-gray-800"
        />
      )}
    />
  );
};
