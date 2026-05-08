import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, ScrollView, Pressable, Modal, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { X, Calendar as CalendarIcon } from "lucide-react-native";
import * as Haptics from 'expo-haptics';

import { useTheme } from "@/context/ThemeContext";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import LoaderSpinner from "@/components/loader-spinner";
import UserHeader from "@/components/layout/user-header";
import { useUser } from "@/context/UserContext";

import { fetchTodayDayActivities } from "@/backend/day";
import { useActivities } from "@/context/ActivitiesContext";
import type { Activity } from "@/types";
import { formatLongDate, formatToISODate } from "@/utils/date";
import { usePositionedActivities } from "@/hooks/usePositionedActivities";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { TimelineView } from "@/components/calendar/timeline-view";

export default function CalendarTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user, isLoading: isUserLoading } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const [isLoading, setIsLoading] = useState(true);
  const { masterActivities, isLoadingActivities } = useActivities();

  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [isDayDetailVisible, setIsDayDetailVisible] = useState(false);

  const positionedActivities = usePositionedActivities(selectedActivities);

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

  const loadCalendarDay = useCallback(async (date: Date) => {
    if (!user || !user.id || isLoadingActivities) return;

    const buildScheduledActivities = (
      rows: any[] | null
    ): Activity[] => {
      const safeRows = rows ?? [];
      return safeRows
        .filter((row) => {
          // Skip day_activities whose parent activity was deleted (not yet synced)
          const base = masterActivities.find(
            (a) => String(a.id) === String(row.activity_id)
          );
          return !!base;
        })
        .map((row) => {
          const base = masterActivities.find(
            (a) => String(a.id) === String(row.activity_id)
          )!;
          return {
            id: row.id,
            user_id: row.user_id,
            activity_id: row.activity_id,
            name: base.name ?? "",
            title: base.name ?? "",
            time_start: row.start_time,
            time_end: row.end_time,
            checkboxes: base.checkboxes ?? [],
            checklist_state: row.checklist_state,
            order_index: row.order_index,
            created_at: row.created_at,
            is_completed: row.is_completed,
          };
        })
        .filter((activity) => {
          if (activity.is_completed === false) return true;
          if (activity.checklist_state?.some((state: boolean) => state === false)) return true;
          if (activity.checkboxes?.length > 0) return true;
          return false;
        });
    };

    const rows = await fetchTodayDayActivities(user.id, formatToISODate(date));
    const builtActivities = buildScheduledActivities(rows);
    setSelectedActivities(builtActivities);
    setIsLoading(false);
  }, [user?.id, isLoadingActivities, masterActivities]);

  useEffect(() => {
    loadCalendarDay(selectedDate);
  }, [loadCalendarDay, selectedDate]);

  // Force reload every time this tab gains focus
  // This uses a counter to break the memoization and ensure fresh data
  const [focusCounter, setFocusCounter] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusCounter(prev => prev + 1);
    }, [])
  );

  useEffect(() => {
    if (focusCounter > 0) {
      loadCalendarDay(selectedDate);
    }
  }, [focusCounter]);

  const handleOpenDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsDayDetailVisible(true);
  };

  const handleCloseDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDayDetailVisible(false);
  };

  const showLoading = isLoading || isUserLoading;

  return (
    <>
      {showLoading ? (
        <LoaderSpinner />
      ) : !user ? (
        <LoaderSpinner />
      ) : (
        <ThemedView style={[styles.mainContainer, { backgroundColor: colors.background }]}>
          <UserHeader user={user} />

          <ThemedView style={styles.body}>
            <ThemedView style={styles.headerBlock}>
              <ThemedText type="title" style={styles.title}>Calendario</ThemedText>
              <ThemedText style={styles.subtitle}>Selecciona un día del mes para ver tus actividades</ThemedText>
            </ThemedView>

            <ScrollView
              style={styles.calendarScroll}
              contentContainerStyle={styles.calendarContent}
              showsVerticalScrollIndicator={false}
            >
              <MonthCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onDayPress={handleOpenDetail}
                goToPreviousMonth={goToPreviousMonth}
                goToNextMonth={goToNextMonth}
                colors={colors}
              />

              <ThemedView style={styles.selectedDayActivities}>
                <ThemedText type="title" style={styles.sectionTitle}>
                  Actividades de {formatLongDate(selectedDate)}
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

                    <Pressable onPress={handleOpenDetail} style={styles.viewTimelineButton}>
                      <ThemedText style={styles.viewTimelineButtonText}>Ver bloques horarios</ThemedText>
                    </Pressable>
                  </>
                )}
              </ThemedView>
            </ScrollView>

            <Modal
              visible={isDayDetailVisible}
              animationType="slide"
              transparent={false}
              onRequestClose={handleCloseDetail}
            >
              <ThemedView style={styles.fullScreenModal}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTitleGroup}>
                    <View style={styles.calendarIconBg}>
                      <CalendarIcon size={20} color={colors.main} />
                    </View>
                    <View>
                      <ThemedText type="subtitle" style={styles.modalTitle}>Bloques Horarios</ThemedText>
                      <ThemedText style={styles.modalSubtitle}>{formatLongDate(selectedDate)}</ThemedText>
                    </View>
                  </View>
                  <Pressable onPress={handleCloseDetail} style={styles.modalCloseButton}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <ScrollView 
                  style={styles.timelineScroll}
                  contentContainerStyle={styles.dayDetailContent}
                  showsVerticalScrollIndicator={false}
                >
                  <TimelineView
                    positionedActivities={positionedActivities}
                    colors={colors}
                  />
                </ScrollView>
              </ThemedView>
            </Modal>
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
      flexDirection: 'column',
      gap: 10,
      padding: 15,
      marginTop: 40,
    },
    body: {
      marginTop: 20,
      flex: 1,
      gap: 12,
      position: "relative",
    },
    headerBlock: {
      gap: 4,
      marginBottom: 10,
    },
    title: {
      fontSize: 26,
      lineHeight: 30,
    },
    subtitle: {
      fontSize: 13,
      opacity: 0.6,
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
      fontWeight: '700',
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      opacity: 0.5,
      marginTop: 10,
    },
    fullScreenModal: {
      flex: 1,
      paddingTop: 50,
      paddingHorizontal: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 25,
    },
    modalHeaderTitleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    calendarIconBg: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.main + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    modalSubtitle: {
      fontSize: 12,
      opacity: 0.5,
      textTransform: 'capitalize',
    },
    modalCloseButton: {
      padding: 8,
      backgroundColor: colors.secondary + '40',
      borderRadius: 12,
    },
    timelineScroll: {
      flex: 1,
    },
    dayDetailContent: {
      paddingBottom: 40,
    },
    activityListItem: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.light_accent,
      marginBottom: 10,
    },
    activityListTime: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.main,
      marginBottom: 4,
    },
    activityListTitle: {
      fontSize: 15,
      fontWeight: '500',
    },
    viewTimelineButton: {
      marginTop: 15,
      paddingVertical: 14,
      borderRadius: 18,
      backgroundColor: colors.secondary,
      alignItems: "center",
    },
    viewTimelineButtonText: {
      fontSize: 14,
      color: colors.background,
      fontWeight: "700",
    },
  });
