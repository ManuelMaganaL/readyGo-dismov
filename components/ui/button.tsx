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
      <Pressable onPress={onPress} style={[styles.general, styles.mainButton, styles.shadow]}>
        <ThemedText type="defaultSemiBold">{text}</ThemedText>
      </Pressable>
    )
  } else if (style === "outline") {
    return (
      <Pressable onPress={onPress} style={[styles.general, styles.outlineButton]}>
        <ThemedText type="defaultSemiBold">{text}</ThemedText>
      </Pressable>
    )
  } else if (style === "secondary") {
    return (
      <Pressable onPress={onPress} style={[styles.general, styles.secondaryButton, styles.shadow]}>
        <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>{text}</ThemedText>
      </Pressable>
    )
  } else {
    return (
      <Pressable onPress={onPress} style={[styles.general, styles.dangerButton, styles.shadow]}>
        <ThemedText type="defaultSemiBold">{text}</ThemedText>
      </Pressable>
    )
  }
}


const styles = StyleSheet.create({
  general: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButton: {
    backgroundColor: MAIN_COLOR,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
  },
  secondaryButton: {
    backgroundColor: '#000',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  dangerButton: {
    backgroundColor: DANGER_COLOR,
  }
})