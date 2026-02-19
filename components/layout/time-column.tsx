import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const START_HOUR = 6;
const END_HOUR = 24;
const HOUR_HEIGHT = 56;

export default function TimeColumn() {
  const hours = useMemo(() => {
    const list: string[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      list.push(`${h.toString().padStart(2, "0")}:00`);
    }
    return list;
  }, []);

  return (
    <ThemedView style={styles.timeColumn}>
      <ThemedView style={styles.timeColumnHeader} />
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

const styles = StyleSheet.create({
  timeColumn: {
    width: 44,
    paddingTop: 0,
  },
  timeColumnHeader: {
    height: 52,
  },
  timeSlot: {
    height: HOUR_HEIGHT,
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  timeLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  daysRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
});
