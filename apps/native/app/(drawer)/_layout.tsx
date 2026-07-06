import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import { ThemeToggle } from "../../components/theme-toggle";
import { useFavoritesCount } from "../../src/utils/use-personalization";

function DrawerLayout() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");
  const favoritesCount = useFavoritesCount();

  const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

  return (
    <Drawer
      screenOptions={{
        headerTintColor: themeColorForeground,
        headerStyle: { backgroundColor: themeColorBackground },
        headerTitleStyle: {
          fontWeight: "600",
          color: themeColorForeground,
        },
        headerRight: renderThemeToggle,
        drawerStyle: { backgroundColor: themeColorBackground },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "Home",
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>Home</Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: "Hymns",
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>
              Hymns
            </Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons
              name="musical-notes-outline"
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable className="mr-4">
                <Ionicons name="add-outline" size={24} color={themeColorForeground} />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Drawer.Screen
        name="favorites"
        options={{
          headerTitle: "Favorites",
          drawerLabel: ({ color, focused }) => (
            <View className="flex-row items-center">
              <Text style={{ color: focused ? color : themeColorForeground }}>
                Favorites
              </Text>
              {favoritesCount > 0 ? (
                <View className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-accent items-center justify-center">
                  <Text className="text-accent-foreground text-xs font-semibold">
                    {favoritesCount}
                  </Text>
                </View>
              ) : null}
            </View>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons
              name="heart-outline"
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
        }}
      />
    </Drawer>
  );
}

export default DrawerLayout;
