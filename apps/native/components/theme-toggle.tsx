import * as Haptics from "expo-haptics";

import { useAppTheme } from "@/contexts/app-theme-context";
import { Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { withUniwind } from "uniwind";

import Animated, { FadeOut, ZoomIn } from "react-native-reanimated";

const StyledIonicons = withUniwind(Ionicons);

export function ThemeToggle() {
  const { toggleTheme, isLight } = useAppTheme();

  const handlePress = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  };

  return (
    <Pressable onPress={handlePress} className="px-2.5">
      {isLight ? (
        <Animated.View key="moon" entering={ZoomIn} exiting={FadeOut}>
          <StyledIonicons name="moon" size={20} className="text-foreground" />
        </Animated.View>
      ) : (
        <Animated.View key="sun" entering={ZoomIn} exiting={FadeOut}>
          <StyledIonicons name="sunny" size={20} className="text-foreground" />
        </Animated.View>
      )}
    </Pressable>
  );
}
