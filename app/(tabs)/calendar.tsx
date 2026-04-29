import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, ScrollView, Pressable, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "@/context/ThemeContext";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import LoaderSpinner from "@/components/loader-spinner";
import UserHeader from "@/components/layout/user-header";
import { getSessionInfo, getUserInfo } from "@/backend/session";

import { fetchTodayDayActivities } from "@/backend/day";
import { useActivities } from "@/context/ActivitiesContext";
import type { Activity, User } from "@/types";


export default function CalendarTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  
  const [isLoading, setIsLoading] = useState(true);
  const { masterActivities, isLoadingActivities } = useActivities();

  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [isDayDetailVisible, setIsDayDetailVisible] = useState(false);

  const selectedDayLabel = useMemo(() => {
    return selectedDate.toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  }, [selectedDate]);

  const goToMonth = useCallback((offset: number) => {
    setSelectedDate((current) => {
      const year = current.getFullYear();
      const month = current.getMonth() + offset;
      const day = current.getDate();
      return new Date(year, month, day);
    });
  }, []);

  const goToPreviousMonth = useCallback(() => goToMonth(-1), [goToMonth]);
  const goToNextMonth = useCallback(() => goToMonth(1), [goToMonth]);

  const START_HOUR = 6;
  const END_HOUR = 24;
  const HOUR_HEIGHT = 56;

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return (Number.isNaN(hours) ? 0 : hours) * 60 + (Number.isNaN(minutes) ? 0 : minutes);
  };

  const activityDurationMinutes = (timeStart: string, timeEnd: string) => {
    return Math.max(15, timeToMinutes(timeEnd) - timeToMinutes(timeStart));
  };

  const getActivityColor = (seed: string | number, palette: typeof colors) => {
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
  };

  const getReadableTextColor = (backgroundColor: string) => {
    const hex = backgroundColor.replace("#", "");
    const expanded = hex.length === 3
      ? hex.split("").map((char) => char + char).join("")
      : hex;

    const red = parseInt(expanded.slice(0, 2), 16);
    const green = parseInt(expanded.slice(2, 4), 16);
    const blue = parseInt(expanded.slice(4, 6), 16);
    const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

    return luminance > 0.62 ? colors.accent : "#FFFFFF";
  };

  const positionedActivities = useMemo(() => {
    type PositionedActivity = Activity & {
      _startMin: number;
      _endMin: number;
      _col: number;
      _colSpan: number;
    };

    const normalized = selectedActivities
      .filter((activity) => Boolean(activity.time_start) && Boolean(activity.time_end))
      .map((activity) => {
        const start = timeToMinutes(activity.time_start!);
        const end = timeToMinutes(activity.time_end!);
        return {
          ...activity,
          _startMin: start,
          _endMin: Math.max(end, start + 15),
          _col: 0,
          _colSpan: 1,
        } as PositionedActivity;
      })
      .sort((a, b) => a._startMin - b._startMin || a._endMin - b._endMin);

    let cluster: PositionedActivity[] = [];
    let clusterMaxEnd = -Infinity;

    const flushCluster = () => {
      if (cluster.length === 0) return;

      const colEnd: number[] = [];
      for (const item of cluster) {
        let placedCol = -1;
        for (let colIndex = 0; colIndex < colEnd.length; colIndex += 1) {
          if (colEnd[colIndex] <= item._startMin) {
            placedCol = colIndex;
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
      cluster.forEach((item) => {
        item._colSpan = totalCols;
      });

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
  }, [selectedActivities]);

  const loadUser = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const sessionInfo = await getSessionInfo();
    if (!sessionInfo) {
      router.push("/auth/login");
      return;
    }

    const userInfo = await getUserInfo(sessionInfo.id);
    if (!userInfo) {
      router.push("/auth/login");
      return;
    }

    setUser({
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      avatar_url: userInfo.avatar_url ?? null,
      created_at: userInfo.created_at,
    });
    if (!silent) setIsLoading(false);
  }, [router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const loadCalendarDay = useCallback(async (date: Date) => {
    if (!user?.id || isLoadingActivities) return;

    const toISODate = (d: Date) => d.toISOString().split("T")[0];

    const buildScheduledActivities = (
      rows: Awaited<ReturnType<typeof fetchTodayDayActivities>>
    ): Activity[] => {
      const safeRows = rows ?? [];
      return safeRows
        .map((row) => {
          const base = masterActivities.find(
            (a) => String(a.id) === String(row.activity_id)
          );
          return {
            id: row.id, // day_activity row id
            user_id: row.user_id,
            activity_id: row.activity_id,
            name: base?.name ?? "",
            title: base?.name ?? "",
            time_start: row.start_time,
            time_end: row.end_time,
            checkboxes: base?.checkboxes ?? [],
            checklist_state: row.checklist_state,
            order_index: row.order_index,
            created_at: row.created_at,
            is_completed: row.is_completed,
          };
        })
        .filter((activity) => {
          if (activity.is_completed === false) {
            return true;
          }

          if (activity.checklist_state && activity.checklist_state.length > 0) {
            return activity.checklist_state.some((state) => state === false);
          }

          if (activity.checkboxes && activity.checkboxes.length > 0) {
            return true;
          }

          return false;
        });
    };

    const rows = await fetchTodayDayActivities(user.id, toISODate(date));
    const builtActivities = buildScheduledActivities(rows);
    setSelectedActivities(builtActivities);
  }, [user?.id, isLoadingActivities, masterActivities]);

  useEffect(() => {
    loadCalendarDay(selectedDate);
  }, [loadCalendarDay, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadUser(true);
      loadCalendarDay(selectedDate);
    }, [loadUser, loadCalendarDay, selectedDate])
  );

  return (
    <>
      {isLoading ? (
        <LoaderSpinner/>
      ) : (
        <ThemedView style={[styles.mainContainer, { backgroundColor: colors.background }]}>
          <UserHeader user={user!}/>
    
          <ThemedView style={styles.body}>
            <ThemedView style={styles.headerBlock}>
              <ThemedText type="title" style={styles.title}>Calendario</ThemedText>
              <ThemedText style={styles.subtitle}>Selecciona un día del mes para ver las actividades de ese día</ThemedText>
            </ThemedView>
            
    
            <ScrollView
              style={styles.calendarScroll}
              contentContainerStyle={styles.calendarContent}
              showsVerticalScrollIndicator={true}
            >
              <ThemedView style={styles.monthCalendar}>
                <View style={styles.monthHeader}>
                  <Pressable onPress={goToPreviousMonth} style={({ pressed }) => [styles.monthNavButton, pressed && styles.monthNavButtonPressed]}>
                    <ThemedText style={styles.monthNavText}>‹</ThemedText>
                  </Pressable>
                  <ThemedText type="title" style={styles.monthTitle}>
                    {selectedDate.toLocaleString("es-ES", { month: "long", year: "numeric" })}
                  </ThemedText>
                  <Pressable onPress={goToNextMonth} style={({ pressed }) => [styles.monthNavButton, pressed && styles.monthNavButtonPressed]}>
                    <ThemedText style={styles.monthNavText}>›</ThemedText>
                  </Pressable>
                </View>
                <View style={styles.weekHeader}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((label) => (
                    <ThemedText key={label} type="default" style={styles.weekdayLabel}>
                      {label}
                    </ThemedText>
                  ))}
                </View>
                <View style={styles.monthGrid}>
                  {getMonthDays(selectedDate).map((dayItem) => {
                    const isSelected = dayItem.date.toDateString() === selectedDate.toDateString();
                    const isToday = dayItem.date.toDateString() === new Date().toDateString();
                    return (
                      <Pressable
                        key={dayItem.key}
                        style={({ pressed }) => [
                          styles.monthDay,
                          !dayItem.isCurrentMonth && styles.monthDayFaded,
                          isToday && styles.monthDayToday,
                          !isToday && isSelected && styles.monthDaySelected,
                          pressed && styles.monthDayPressed,
                        ]}
                        onPress={() => {
                          setSelectedDate(dayItem.date);
                          setIsDayDetailVisible(true);
                        }}
                      >
                        <ThemedText style={styles.monthDayNumber}>{dayItem.dayNumber}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </ThemedView>

              <ThemedView style={styles.selectedDayActivities}>
                <ThemedText type="title" style={styles.sectionTitle}>
                  Actividades de {selectedDayLabel}
                </ThemedText>

                {selectedActivities.length === 0 ? (
                  <ThemedText style={styles.emptyText}>
                    No hay actividades registradas para este día.
                  </ThemedText>
                ) : (
                  <>
                    {selectedActivities.map((activity) => (
                      <ThemedView key={String(activity.id)} style={styles.activityListItem}>
                        <ThemedText style={styles.activityListTime}>
                          {activity.time_start?.slice(0, 5) ?? "--:--"} - {activity.time_end?.slice(0, 5) ?? "--:--"}
                        </ThemedText>
                        <ThemedText style={styles.activityListTitle} numberOfLines={2}>
                          {activity.title || activity.name || "Actividad pendiente"}
                        </ThemedText>
                      </ThemedView>
                    ))}

                    <Pressable onPress={() => setIsDayDetailVisible(true)} style={styles.viewTimelineButton}>
                      <ThemedText style={styles.viewTimelineButtonText}>Ver bloques horarios</ThemedText>
                    </Pressable>
                  </>
                )}
              </ThemedView>
            </ScrollView>

            {isDayDetailVisible && (
              <ThemedView style={styles.dayDetailOverlay}>
                <ScrollView contentContainerStyle={styles.dayDetailContent}>
                  <ThemedView style={styles.dayDetailHeader}>
                    <Pressable onPress={() => setIsDayDetailVisible(false)} style={styles.closeButton}>
                      <ThemedText style={styles.closeButtonText}>Cerrar</ThemedText>
                    </Pressable>
                    <ThemedText type="title" style={styles.sectionTitle}>
                      Actividades de {selectedDayLabel}
                    </ThemedText>
                  </ThemedView>

                  {positionedActivities.length === 0 ? (
                    <ThemedText style={styles.emptyText}>
                      No hay actividades con horario para este día.
                    </ThemedText>
                  ) : (
                    <ThemedView style={styles.timelineWrapper}>
                      <ThemedView style={styles.timelineLabels}>
                        {Array.from({ length: END_HOUR - START_HOUR }).map((_, index) => {
                          const hour = START_HOUR + index;
                          return (
                            <ThemedText key={hour} style={styles.hourLabel}>
                              {hour.toString().padStart(2, "0")} :00
                            </ThemedText>
                          );
                        })}
                      </ThemedView>

                      <ThemedView style={[styles.timelineGrid, { height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }]}> 
                        {Array.from({ length: END_HOUR - START_HOUR }).map((_, index) => (
                          <ThemedView
                            key={`line-${index}`}
                            style={[
                              styles.gridLine,
                              { top: index * HOUR_HEIGHT },
                            ]}
                          />
                        ))}

                        {positionedActivities.map((activity) => {
                          const activityColor = getActivityColor(activity.activity_id ?? activity.id, colors);
                          const textColor = getReadableTextColor(activityColor);
                          const windowStart = START_HOUR * 60;
                          const windowEnd = END_HOUR * 60;
                          const visibleStart = Math.max(activity._startMin, windowStart);
                          const visibleEnd = Math.min(activity._endMin, windowEnd);
                          if (visibleEnd <= visibleStart) return null;

                          const top = ((visibleStart - windowStart) / (windowEnd - windowStart)) * (END_HOUR - START_HOUR) * HOUR_HEIGHT;
                          const height = Math.max(
                            (activityDurationMinutes(activity.time_start ?? "00:00", activity.time_end ?? activity.time_start ?? "00:00") / (windowEnd - windowStart)) * (END_HOUR - START_HOUR) * HOUR_HEIGHT,
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
                  )}
                </ScrollView>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      )}
    </>
  );
}

const createStyles = (colors: any) =>
StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 14,
    paddingHorizontal: 14,
    paddingTop: 16,
    marginTop: 24,
  },
  body: {
    flex: 1,
    gap: 12,
    position: "relative",
  },
  headerBlock: {
    gap: 6,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  
  calendarScroll: {
    flex: 1,
  },
  calendarContent: {
    paddingBottom: 24,
  },
  selectedDayActivities: {
    marginTop: 18,
    gap: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
  },
  dayDetailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  dayDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.light_accent,
  },
  closeButtonText: {
    fontSize: 14,
    color: colors.main,
  },
  dayDetailContent: {
    paddingBottom: 24,
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
    height: 56,
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
  activityListItem: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.light_accent,
    marginBottom: 10,
  },
  activityListTime: {
    fontSize: 12,
    opacity: 0.75,
    marginBottom: 4,
  },
  activityListTitle: {
    fontSize: 15,
  },
  viewTimelineButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: "center",
  },
  viewTimelineButtonText: {
    fontSize: 14,
    color: colors.background,
    fontWeight: "600",
  },
  monthCalendar: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light_accent,
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  monthTitle: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  monthNavButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light_accent,
  },
  monthNavButtonPressed: {
    opacity: 0.75,
  },
  monthNavText: {
    fontSize: 18,
    fontWeight: "700",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 32,
    textAlign: "center",
    opacity: 0.7,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthDay: {
    width: "13.5%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 8,
  },
  monthDayNumber: {
    fontSize: 14,
  },
  monthDayFaded: {
    opacity: 0.35,
  },
  monthDayToday: {
    backgroundColor: colors.secondary,
  },
  monthDaySelected: {
    backgroundColor: colors.light_accent,
  },
  monthDayPressed: {
    opacity: 0.7,
  },
});

function getMonthDays(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const startDate = new Date(year, month, 1 - startDay);

  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      key: date.toISOString(),
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

