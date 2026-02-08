import type { FC } from "react";

import { ActivityIndicator, TextInput, View } from "react-native";
import { useState } from "react";

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

  const handleChangeText = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <View className="relative w-full">
      <TextInput
        className="h-12 bg-gray-100 rounded-xl px-4 text-base text-gray-900 border border-gray-200"
        value={query}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {isLoading && (
        <View className="absolute right-4 top-0 bottom-0 justify-center">
          <ActivityIndicator size="small" color="#666666" />
        </View>
      )}
    </View>
  );
};
