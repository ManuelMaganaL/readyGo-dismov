import React from 'react';
import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { PositionedActivity } from '@/hooks/usePositionedActivities';
import { getActivityColor, getReadableTextColor } from '@/utils/ui';
import { getActivityDurationMinutes } from '@/utils/date';

interface TimelineViewProps {
  positionedActivities: PositionedActivity[];
  colors: any;
  startHour?: number;
  endHour?: number;
  hourHeight?: number;
}

export function TimelineView({
  positionedActivities,
  colors,
  startHour = 6,
  endHour = 24,
  hourHeight = 56,
}: TimelineViewProps) {
  const router = useRouter();
  const styles = createStyles(colors, hourHeight);

  if (positionedActivities.length === 0) {
    return (
      <ThemedText style={styles.emptyText}>
        No hay actividades con horario para este día.
      </ThemedText>
    );
  }

  return (
    <ThemedView style={styles.timelineWrapper}>
      <ThemedView style={styles.timelineLabels}>
        {Array.from({ length: endHour - startHour }).map((_, index) => {
          const hour = startHour + index;
          return (
            <ThemedText key={hour} style={styles.hourLabel}>
              {hour.toString().padStart(2, "0")} :00
            </ThemedText>
          );
        })}
      </ThemedView>

      <ThemedView style={[styles.timelineGrid, { height: (endHour - startHour) * hourHeight }]}>
        {Array.from({ length: endHour - startHour }).map((_, index) => (
          <ThemedView
            key={`line-${index}`}
            style={[
              styles.gridLine,
              { top: index * hourHeight },
            ]}
          />
        ))}

        {positionedActivities.map((activity) => {
          const activityColor = getActivityColor(activity.activity_id ?? activity.id, colors);
          const textColor = getReadableTextColor(activityColor, colors);
          const windowStart = startHour * 60;
          const windowEnd = endHour * 60;
          const visibleStart = Math.max(activity._startMin, windowStart);
          const visibleEnd = Math.min(activity._endMin, windowEnd);
          if (visibleEnd <= visibleStart) return null;

          const top = ((visibleStart - windowStart) / (windowEnd - windowStart)) * (endHour - startHour) * hourHeight;
          const height = Math.max(
            (getActivityDurationMinutes(activity.time_start ?? "00:00", activity.time_end ?? activity.time_start ?? "00:00") / (windowEnd - windowStart)) * (endHour - startHour) * hourHeight,
            38
          );
          const cols = activity._colSpan || 1;
          const col = activity._col || 0;
          const leftPct = (col * 100) / cols;
          const widthPct = 100 / cols;

          return (
            <Pressable
              key={String(activity.id)}
              onPress={() => router.push({ pathname: "/activities/[id]", params: { id: String(activity.activity_id ?? activity.id) } })}
              style={({ pressed }) => [
                styles.activityBlock,
                {
                  top,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  height,
                  backgroundColor: activityColor,
                  borderColor: textColor === "#FFFFFF" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)",
                  opacity: pressed ? 0.95 : 1,
                },
              ]}
            >
              <ThemedText style={[styles.activityBlockTime, { color: textColor }]}>
                {activity.time_start?.slice(0, 5) ?? "--:--"} - {activity.time_end?.slice(0, 5) ?? "--:--"}
              </ThemedText>
              <ThemedText style={[styles.activityBlockTitle, { color: textColor }]} numberOfLines={2}>
                {activity.title || activity.name || "Actividad pendiente"}
              </ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
}

const createStyles = (colors: any, hourHeight: number) =>
  StyleSheet.create({
    emptyText: {
      fontSize: 14,
      opacity: 0.7,
      textAlign: 'center',
      marginTop: 20,
    },
    timelineWrapper: {
      flexDirection: "row",
      gap: 10,
      marginTop: 6,
    },
    timelineLabels: {
      width: 58,
    },
    hourLabel: {
      fontSize: 11,
      color: colors.text_secondary ?? colors.text,
      height: hourHeight,
      textAlign: "right",
      paddingRight: 8,
    },
    timelineGrid: {
      flex: 1,
      position: "relative",
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.light_accent,
      overflow: "hidden",
    },
    gridLine: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.light_accent,
      opacity: 0.3,
    },
    activityBlock: {
      position: "absolute",
      padding: 10,
      borderRadius: 14,
      borderWidth: 1,
      justifyContent: "center",
      minHeight: 40,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.16,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    activityBlockTime: {
      fontSize: 11,
      opacity: 0.85,
      marginBottom: 4,
    },
    activityBlockTitle: {
      fontSize: 13,
      lineHeight: 16,
    },
  });
