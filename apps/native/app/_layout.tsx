import "../global.css";

import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { HeroUINativeProvider } from "heroui-native";
import { Stack } from "expo-router";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

import { AppThemeProvider } from "../contexts/app-theme-context";
import { initializeDatabase, sqliteDb } from "../src/data/database/service";

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

function StackLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="hymn/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ title: "Modal", presentation: "modal" }}
      />
    </Stack>
  );
}

/**
 * Run the one-shot DB initialization (Drizzle migrations + seed) and gate
 * the app tree behind it. Drizzle's `useLiveQuery` requires the connection
 * to be ready before any screen subscribes.
 */
function AppBootstrap({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    initializeDatabase()
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setErrorMessage(String(e));
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }
  if (status === "error") {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-foreground text-base mb-2">
          Couldn't initialize the hymn database.
        </Text>
        <Text className="text-muted text-xs text-center">{errorMessage}</Text>
      </View>
    );
  }
  return <>{children}</>;
}

export default function Layout() {
  // Mounts the Expo Drizzle Studio dev plugin against the same SQLite handle
  // Drizzle uses. No-op in production builds (the plugin only attaches when
  // the Expo dev tools are connected).
  useDrizzleStudio(sqliteDb);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <HeroUINativeProvider>
            <AppBootstrap>
              <StackLayout />
            </AppBootstrap>
          </HeroUINativeProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
