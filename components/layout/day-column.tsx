import { useMemo, } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import type { Activity } from "@/types";
import { MAIN_COLOR, SECONDARY_COLOR } from "@/constants/theme";

type DayKey = "today" | "tomorrow";

const START_HOUR = 6;
const END_HOUR = 24;
const HOUR_HEIGHT = 56;

export default function DayColumn({
  dayKey,
  activities,
  isSelected,
  onSelect,
}: {
  dayKey: DayKey;
  activities: Activity[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { name, date } = useMemo(() => getDayLabel(dayKey), [dayKey]);
  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  function getDayLabel(key: DayKey): { name: string; date: string } {
    const d = new Date();
    if (key === "tomorrow") d.setDate(d.getDate() + 1);
    return {
      name: d.toLocaleString("es-ES", { weekday: "long" }),
      date: d.toLocaleString("es-ES", { day: "numeric", month: "long" }),
    };
  }

  function activityTopMinutes(timeStart: string): number {
    return timeToMinutes(timeStart) - START_HOUR * 60;
  }
  
  function activityDurationMinutes(timeStart: string, timeEnd: string): number {
    return timeToMinutes(timeEnd) - timeToMinutes(timeStart);
  }

  function timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  }
  
  return (
    <ThemedView style={styles.dayColumn}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          styles.dayHeader,
          pressed && styles.dayHeaderPressed,
        ]}
      >
        <ThemedText type="defaultSemiBold" style={styles.dayName}>
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.dayDate}>
          {date}
        </ThemedText>
      </Pressable>

      <ThemedView style={[styles.dayGrid, { height: totalHeight }]}>
        {/* Líneas horizontales por hora */}
        {Array.from({ length: END_HOUR - START_HOUR - 1 }).map((_, i) => (
          <ThemedView
            key={i}
            style={[
              styles.gridLine,
              { top: (i + 1) * HOUR_HEIGHT },
            ]}
          />
        ))}
        {/* Bloques de actividades posicionados por horario */}
        {activities.map((activity) => {
          const topMinutes = activityTopMinutes(activity.time_start);
          const durationMinutes = activityDurationMinutes(
            activity.time_start,
            activity.time_end
          );
          const top = (topMinutes / 60) * HOUR_HEIGHT;
          const height = Math.max(
            (durationMinutes / 60) * HOUR_HEIGHT - 4,
            28
          );

          return (
            <ThemedView
              key={activity.id}
              style={[
                styles.activityBlock,
                {
                  top: top + 2,
                  height,
                },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.activityBlockTitle}
                numberOfLines={2}
              >
                {activity.title}
              </ThemedText>
            </ThemedView>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  dayColumn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
  },
  dayHeader: {
    height: 52,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: SECONDARY_COLOR,
    backgroundColor: SECONDARY_COLOR,
    justifyContent: "center",
  },
  dayHeaderPressed: {
    opacity: 0.9,
  },
  dayName: {
    fontSize: 15,
  },
  dayDate: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.85,
  },
  dayGrid: {
    position: "relative",
    width: "100%",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: SECONDARY_COLOR,
  },
  activityBlock: {
    position: "absolute",
    left: 4,
    right: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: SECONDARY_COLOR,
    borderLeftWidth: 3,
    borderLeftColor: MAIN_COLOR,
  },
  activityBlockDark: {
    backgroundColor: SECONDARY_COLOR,
  },
  activityBlockTitle: {
    fontSize: 13,
  },
  activityBlockTime: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.9,
  },
});