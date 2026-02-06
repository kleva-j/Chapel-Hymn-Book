import "@/global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { HeroUINativeProvider } from "heroui-native";
import { Stack } from "expo-router";

import { AppThemeProvider } from "@/contexts/app-theme-context";

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

function StackLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ title: "Modal", presentation: "modal" }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <HeroUINativeProvider>
            <StackLayout />
          </HeroUINativeProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
