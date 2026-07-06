import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function TabLayout() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: themeColorBackground,
        },
        headerTintColor: themeColorForeground,
        headerTitleStyle: {
          color: themeColorForeground,
          fontWeight: "600",
        },
        // Tabs wrapper is kept for Phase 3 (Favorites slots in here) but
        // with only one child the tabBar would render a lonely chip — hide
        // it for now.
        tabBarStyle: { display: "none" },
      }}
    >
      {/*
        Only the Hymns tab is wired today. The dedicated Search tab was
        removed in favor of an in-list search bar (PR #12) so the search
        slot is free; Favorites will reclaim it in Phase 3 without nav
        rework. The `tabBar` is hidden while there is only one screen so
        the single-tab UI does not look broken.
      */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Hymns",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
