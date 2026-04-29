import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/context/ThemeContext";

import type { Activity } from "@/types";

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
  const [gridHeight, setGridHeight] = useState<number>(totalHeight);
  
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const headerColor = colors.light_accent;
  const gridLineColor = colors.secondary;

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

  function getActivityColor(seed: string | number, palette: typeof colors): string {
    const swatches = [
      "#FF7A59",
      "#5DA9FF",
      "#B45DFF",
      "#46C9B8",
      "#31A24C",
      "#FFB547",
      palette.main,
    ];

    const key = String(seed);
    let hash = 0;
    for (let index = 0; index < key.length; index += 1) {
      hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
    }

    return swatches[hash % swatches.length];
  }

  function getReadableTextColor(backgroundColor: string): string {
    const hex = backgroundColor.replace("#", "");
    const expanded = hex.length === 3
      ? hex.split("").map((char) => char + char).join("")
      : hex;

    const red = parseInt(expanded.slice(0, 2), 16);
    const green = parseInt(expanded.slice(2, 4), 16);
    const blue = parseInt(expanded.slice(4, 6), 16);
    const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

    return luminance > 0.62 ? colors.accent : "#FFFFFF";
  }

  type PositionedActivity = Activity & {
    _startMin: number;
    _endMin: number;
    _col: number;
    _colSpan: number;
  };

  const positionedActivities: PositionedActivity[] = useMemo(() => {
    // Only place activities that have valid times.
    const normalized = (activities ?? [])
      .filter((a) => Boolean(a.time_start) && Boolean(a.time_end))
      .map((a) => {
        const start = timeToMinutes(a.time_start!);
        const end = timeToMinutes(a.time_end!);
        return {
          ...a,
          _startMin: start,
          _endMin: Math.max(end, start + 1),
          _col: 0,
          _colSpan: 1,
        };
      })
      .sort((a, b) => a._startMin - b._startMin || a._endMin - b._endMin);

    // Greedy interval coloring inside overlap clusters.
    let cluster: PositionedActivity[] = [];
    let clusterMaxEnd = -Infinity;

    const flushCluster = () => {
      if (cluster.length === 0) return;

      const colEnd: number[] = [];
      for (const item of cluster) {
        let placedCol = -1;
        for (let c = 0; c < colEnd.length; c++) {
          if (colEnd[c] <= item._startMin) {
            placedCol = c;
            break;
          }
        }
        if (placedCol === -1) {
          placedCol = colEnd.length;
          colEnd.push(item._endMin);
        } else {
          colEnd[placedCol] = item._endMin;
        }
        item._col = placedCol;
      }

      const totalCols = Math.max(1, colEnd.length);
      for (const item of cluster) item._colSpan = totalCols;

      cluster = [];
      clusterMaxEnd = -Infinity;
    };

    for (const item of normalized) {
      if (cluster.length === 0) {
        cluster.push(item);
        clusterMaxEnd = item._endMin;
        continue;
      }

      if (item._startMin < clusterMaxEnd) {
        cluster.push(item);
        clusterMaxEnd = Math.max(clusterMaxEnd, item._endMin);
      } else {
        flushCluster();
        cluster.push(item);
        clusterMaxEnd = item._endMin;
      }
    }
    flushCluster();

    return normalized;
  }, [activities]);
  const effectiveHeight = gridHeight || totalHeight;
  
  

  return (
    <ThemedView style={styles.dayColumn}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          styles.dayHeader,
          { borderBottomColor: headerColor },
          isSelected && styles.dayHeaderSelected,
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

      <ThemedView
        style={[styles.dayGrid, { height: totalHeight }]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h && h > 0 && h !== gridHeight) setGridHeight(h);
        }}
      >
        
        {/* Líneas horizontales por hora */}
        {Array.from({ length: END_HOUR - START_HOUR - 1 }).map((_, i) => (
          <ThemedView
            key={i}
            style={[
              styles.gridLine,
              { backgroundColor: gridLineColor },
              { top: ((i + 1) * effectiveHeight) / (END_HOUR - START_HOUR) },
            ]}
          />
        ))}
        
        {/* Bloques de actividades posicionados por horario */}
        {positionedActivities.map((activity) => {
          const activityColor = getActivityColor(activity.activity_id ?? activity.id, colors);
          const textColor = getReadableTextColor(activityColor);

          // Use absolute minute values stored on the positioned activity
          const absStart = activity._startMin; // minutes since 00:00
          const absEnd = activity._endMin;

          // Clip to visible window
          const windowStart = START_HOUR * 60;
          const windowEnd = END_HOUR * 60;
          const visibleStart = Math.max(absStart, windowStart);
          const visibleEnd = Math.min(absEnd, windowEnd);

          // If activity is completely outside the visible window, skip rendering
          if (visibleEnd <= visibleStart) return null;

          const topMinutes = visibleStart - windowStart;
          const durationMinutes = Math.max(15, activityDurationMinutes(activity.time_start ?? "00:00", activity.time_end ?? activity.time_start ?? "00:00"));
          const visibleWindowMinutes = (END_HOUR - START_HOUR) * 60;
          const top = (topMinutes / visibleWindowMinutes) * effectiveHeight;
          // height proportional to the visible window and the real duration
          const height = Math.max((durationMinutes / visibleWindowMinutes) * effectiveHeight, 36);

          const cols = activity._colSpan || 1;
          const col = activity._col || 0;
          const leftPct = (col * 100) / cols;
          const widthPct = 100 / cols;
          const hrefId = String(activity.activity_id ?? activity.id);

          if (__DEV__) {
            // Debug values in console only
            // eslint-disable-next-line no-console
            console.debug(`ACTPOS id=${activity.id} start=${activity.time_start} end=${activity.time_end} _startMin=${activity._startMin} visibleStart=${visibleStart} topMinutes=${topMinutes} top=${top.toFixed(1)} height=${height.toFixed(1)} gridH=${gridHeight}`);
          }

          return (
            <Pressable
              key={String(activity.id)}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: "/activities/[id]", params: { id: hrefId } })}
              style={({ pressed }) => [
                styles.activityBlock,
                {
                  top: top + 2,
                  height,
                  backgroundColor: activityColor,
                  borderColor: textColor === "#FFFFFF" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)",
                  zIndex: 10,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  opacity: pressed ? 0.95 : 1,
                },
              ]}
            >
              <View style={[styles.activityBlockContent, { paddingHorizontal: 8 }]}> 
                <Text style={[styles.activityBlockTime, { color: textColor }]} numberOfLines={1}>
                  {`${activity.time_start?.slice(0, 5) ?? "--:--"} - ${activity.time_end?.slice(0, 5) ?? "--:--"}`}
                </Text>
                <Text style={[styles.activityBlockTitle, { color: textColor }]} numberOfLines={2}>
                  {activity.title || activity.name || "Actividad pendiente"}
                </Text>
              </View>
            </Pressable>
          );

        })}
      </ThemedView>
    </ThemedView>
  );
}


const createStyles = (colors: any) =>
   StyleSheet.create({
  dayColumn: {
    flex: 1,
    minWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: colors.light_accent,
    backgroundColor: colors.background,
  },
  dayHeader: {
    height: 52,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light_accent,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  dayHeaderPressed: {
    opacity: 0.8,
  },
  dayHeaderSelected: {
    backgroundColor: colors.light_accent,
  },
  dayName: {
    fontSize: 15,
    textAlign: "center",
  },
  dayDate: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.85,
    textAlign: "center",
  },
  dayGrid: {
    position: "relative",
    width: "100%",
    backgroundColor: colors.background,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.light_accent,
    opacity: 0.22,
  },
  activityBlock: {
    position: "absolute",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 64,
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  activityBlockContent: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    alignItems: "flex-start",
    gap: 4,
  },
  activityCard: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: 8,
    zIndex: 20,
  },
  activityBlockDark: {
    backgroundColor: colors.secondary,
  },
  activityBlockTitle: {
    fontSize: 12,
    lineHeight: 14,
  },
  activityBlockTime: {
    fontSize: 10,
    opacity: 0.9,
    letterSpacing: 0.4,
  },
});