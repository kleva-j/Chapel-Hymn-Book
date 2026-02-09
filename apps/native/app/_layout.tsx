import "@/global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Provider as TinybaseProvider } from "tinybase/ui-react";
import { HeroUINativeProvider } from "heroui-native";
import { Stack } from "expo-router";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { useHymnStore } from "@/data/database";

export const unstable_settings = { initialRouteName: "(drawer)" };

function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ title: "Modal", presentation: "modal" }}
      />
    </Stack>
  );
}

export default function Layout() {
  const store = useHymnStore();

  return (
    <TinybaseProvider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <AppThemeProvider>
            <HeroUINativeProvider>
              <StackLayout />
            </HeroUINativeProvider>
          </AppThemeProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </TinybaseProvider>
  );
}
