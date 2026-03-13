import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";

import type { ButtonProps } from "@/types";
import { useTheme } from "@/context/ThemeContext";


export default function Button({
  text,
  style,
  onPress,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
      <Pressable
        onPress={onPress}
        style={[
          styles.general,
          styles.secondaryButton,
          styles.shadow
        ]}
      >
        <ThemedText
          type="defaultSemiBold"
          style={{ color: colors.opposite_text }}
        >
          {text}
        </ThemedText>
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


const createStyles = (colors:any) => 
StyleSheet.create({
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
    backgroundColor: colors.main,
  },
  secondaryButton: {
    backgroundColor: colors.accent,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  }
})