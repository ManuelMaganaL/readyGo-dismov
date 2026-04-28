import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme   } from "@/context/ThemeContext";

const START_HOUR = 6;
const END_HOUR = 24;
const HOUR_HEIGHT = 56;

export default function TimeColumn() {
  const { colors } = useTheme();
  const styles = createStyles(colors); 
  const hours = useMemo(() => {
    const list: string[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      list.push(`${h.toString().padStart(2, "0")}:00`);
    }
    return list;
  }, []);

  return (
    <ThemedView style={styles.timeColumn}>
      <ThemedView style={styles.timeColumnHeader}>
        <ThemedText type="defaultSemiBold" style={styles.timeColumnTitle}>
          Hora
        </ThemedText>
      </ThemedView>
      {hours.map((label) => (
        <ThemedView key={label} style={styles.timeSlot}>
          <ThemedText type="default" style={styles.timeLabel}>
            {label}
          </ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
  timeColumn: {
    width: 54,
    paddingTop: 0,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.light_accent,
  },
  timeColumnHeader: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.light_accent,
  },
  timeSlot: {
    height: HOUR_HEIGHT,
    justifyContent: "flex-start",
    paddingTop: 4,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 11,
    opacity: 0.68,
    letterSpacing: 0.2,
  },
  timeColumnTitle: {
    fontSize: 11,
    opacity: 0.72,
  },
  daysRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
});
