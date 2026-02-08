import type { FC } from "react";

import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { useState } from "react";

import {
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Platform,
  View,
} from "react-native";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchBar: FC<SearchBarProps> = ({
  onSearch,
  isLoading = false,
  placeholder = "Search hymns by title or number...",
}) => {
  const [query, setQuery] = useState("");
  const themeColorForeground = useThemeColor("foreground");

  const handleChangeText = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const handleClear = () => {
    handleChangeText("");
  };

  return (
    <View className="relative w-full">
      <TextInput
        className="h-12 bg-gray-100 dark:bg-gray-900/60 rounded-xl px-4 pr-12 text-base text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800"
        value={query}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <View className="absolute right-4 top-0 bottom-0 flex-row items-center gap-2">
        {isLoading ? (
          <ActivityIndicator size="small" color="#666666" />
        ) : (
          Platform.OS === "android" &&
          query.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={themeColorForeground}
                style={{ opacity: 0.5 }}
              />
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};
