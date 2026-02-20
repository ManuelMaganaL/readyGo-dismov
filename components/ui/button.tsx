import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";

import type { ButtonProps } from "@/types";
import { MAIN_COLOR, SECONDARY_COLOR, DANGER_COLOR, ACCENT_COLOR } from "@/constants/theme";


export default function Button({
  text,
  style,
  onPress,
}: ButtonProps) {
  if (style === "main") {
    return (
      <Pressable onPress={onPress} style={[styles.general, styles.mainButton]}>
        <ThemedText type="defaultSemiBold">{text}</ThemedText>
      </Pressable>
    )
  } else if (style === "secondary") {
    return (
      <Pressable onPress={onPress} style={[styles.general, styles.secondaryButton]}>
        <ThemedText type="default">{text}</ThemedText>
      </Pressable>
    )
  } else {
    return (
      <Pressable onPress={onPress} style={[styles.general, styles.dangerButton]}>
        <ThemedText type="defaultSemiBold">{text}</ThemedText>
      </Pressable>
    )
  }
}


const styles = StyleSheet.create({
  general: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  mainButton: {
    backgroundColor: SECONDARY_COLOR,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
  },
  dangerButton: {
    backgroundColor: DANGER_COLOR,
  }
})