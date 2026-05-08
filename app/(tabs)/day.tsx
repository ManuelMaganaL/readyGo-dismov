import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, ScrollView, Platform, UIManager, View } from "react-native";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, CirclePlus, Trophy } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { LinearTransition } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';

import UserHeader from "@/components/layout/user-header";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";
import LoaderSpinner from "@/components/loader-spinner";
import ActivityBlock from "@/components/layout/day-activity-block";
import TodaysCalendar from "@/components/layout/todays-calendar";
import AddActivityModal from "@/components/modal/add-activity";
import DeleteActivityModal from "@/components/modal/delete-activity";
import ModifyActivityModal from "@/components/modal/modify-activity";
import ActivitySkeleton from "@/components/ui/activity-skeleton";
import StatsModal from "@/components/modal/stats-modal";

import {
  fetchTodayDayActivities,
  deleteDayActivity,
  updateDayActivityCompletion,
} from "@/backend/day";

import type { Activity } from "@/types";
import { useActivities } from "@/context/ActivitiesContext";
import { sendCompletionNotification, removeDayActivityReminder, removeDayActivityOntimeAlert } from "@/utils/notifications";

import { useUser } from "@/context/UserContext";
import { formatLongDate, timeToMinutes, formatToISODate } from "@/utils/date";
import { logger } from "@/utils/logger";

export default function DayTab() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDayLoading, setIsDayLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { masterActivities, isLoadingActivities } = useActivities();

  useEffect(() => {
    const isFabricEnabled = !!(globalThis as any).nativeFabricUIManager;
    if (
      Platform.OS === "android" &&
      !isFabricEnabled &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Cargar actividades del dia desde Supabase cuando cambia el usuario o la fecha seleccionada
  useEffect(() => {
    if (!user || isLoadingActivities) return;

    let cancelled = false;
    if (isLoading) {
      setIsLoading(true);
    } else {
      setIsDayLoading(true);
    }

    const loadDayActivities = async () => {
      const selectedIso = formatToISODate(selectedDate);
      const rows = await fetchTodayDayActivities(user.id, selectedIso);

      if (cancelled) return;

      const safeRows = rows ?? [];
      const built: Activity[] = safeRows
        .filter(row => {
          // Skip day_activities whose parent activity was deleted (not yet synced to server)
          const base = masterActivities.find(a => String(a.id) === String(row.activity_id));
          return !!base;
        })
        .map(row => {
          const base = masterActivities.find(a => String(a.id) === String(row.activity_id))!;
          return {
            id: row.id,
            user_id: row.user_id,
            activity_id: row.activity_id,
            name: base.name ?? "",
            title: base.name ?? "",
            time_start: row.start_time,
            time_end: row.end_time,
            checkboxes: row.checkboxes ?? base.checkboxes ?? [],
            checklist_state: row.checklist_state,
            order_index: row.order_index,
            created_at: row.created_at,
          };
        });

      const completedIds = safeRows.filter(r => r.is_completed).map(r => r.id);
      setActivities(built);
      setCompletedActivityIds(completedIds);
      setIsDayLoading(false);
      setIsLoading(false);
    };

    loadDayActivities();

    return () => {
      cancelled = true;
    };
  }, [user, isLoadingActivities, masterActivities, selectedDate]);

  // Estados para los bloques de actividades (keyed by activity ID)
  const [isDetailed, setIsDetailed] = useState<Record<string, boolean>>({});

  const toggleDetailById = (id: string | number) => {
    setIsDetailed(prev => ({
      ...prev,
      [String(id)]: !prev[String(id)],
    }));
  };

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);
  const [idToModify, setIdToModify] = useState<string | null>(null);
  const [completedActivityIds, setCompletedActivityIds] = useState<Array<string | number>>([]);
  /** false = más temprano primero (asc), true = más tarde primero (desc) */
  const [sortTimeDesc, setSortTimeDesc] = useState(false);

  const compareByTimeThenName = (a: Activity, b: Activity) => {
    const aStartMinutes = timeToMinutes(a.time_start || "23:59");
    const bStartMinutes = timeToMinutes(b.time_start || "23:59");

    let cmp = 0;
    if (aStartMinutes !== bStartMinutes) {
      cmp = aStartMinutes - bStartMinutes;
    } else {
      const aEndMinutes = timeToMinutes(a.time_end || "23:59");
      const bEndMinutes = timeToMinutes(b.time_end || "23:59");
      if (aEndMinutes !== bEndMinutes) {
        cmp = aEndMinutes - bEndMinutes;
      } else {
        const aName = (a.title ?? a.name ?? "").trim();
        const bName = (b.title ?? b.name ?? "").trim();
        cmp = aName.localeCompare(bName, "es", { sensitivity: "base" });
      }
    }
    return sortTimeDesc ? -cmp : cmp;
  };

  const orderedActivities = [
    ...activities
      .filter(activity => !completedActivityIds.includes(activity.id))
      .sort(compareByTimeThenName),
    ...activities
      .filter(activity => completedActivityIds.includes(activity.id))
      .sort(compareByTimeThenName),
  ];

  const handleCompletionChange = (activityId: string | number, completed: boolean, checklistState: boolean[]) => {
    setCompletedActivityIds(prev => {
      if (completed) {
        if (prev.includes(activityId)) return prev;
        return [...prev, activityId];
      }
      return prev.filter(id => id !== activityId);
    });
    // Persistir en Supabase (fire-and-forget)
    updateDayActivityCompletion(String(activityId), completed, checklistState)
      .catch(err => logger.error("Error persisting completion:", err));
    // Notificación al completar
    if (completed) {
      const activity = activities.find(a => a.id === activityId);
      const actName = activity?.title ?? activity?.name ?? "";
      sendCompletionNotification(actName).catch(() => { });
    }
  };

  const handleStatsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsStatsVisible(true);
  };

  if (isUserLoading || !user) {
    return <LoaderSpinner />;
  }

  return (
    <ThemedView style={styles.mainContainer}>
      <UserHeader user={user} />

      <ThemedView style={styles.body}>
        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.mainTitle}>{formatLongDate(selectedDate)}</ThemedText>
          <Pressable onPress={handleStatsPress} style={styles.statsButton}>
            <Trophy size={22} color={colors.icon} />
          </Pressable>
        </View>

        <TodaysCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <ThemedView style={styles.sectionHeader}>
          <View style={styles.spacer} />
          <Pressable
            style={styles.sortButton}
            onPress={() => setSortTimeDesc(prev => !prev)}
          >
            {sortTimeDesc ? (
              <ArrowDownWideNarrow size={18} color={colors.main} />
            ) : (
              <ArrowUpNarrowWide size={18} color={colors.main} />
            )}
            <ThemedText style={styles.sortButtonText}>
              {sortTimeDesc ? "Más tarde" : "Más temprano"}
            </ThemedText>
          </Pressable>
        </ThemedView>

        <ScrollView
          style={styles.dayScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading || isDayLoading ? (
            <ThemedView style={styles.activitiesContainer}>
              <ActivitySkeleton />
              <ActivitySkeleton />
              <ActivitySkeleton />
              <ActivitySkeleton />
            </ThemedView>
          ) : orderedActivities.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No hay actividades hoy</ThemedText>
              <ThemedText style={styles.emptySubtext}>Pulsa el botón + para empezar</ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.activitiesContainer}>
              {orderedActivities.map((item, index) => {
                const isCompleted = completedActivityIds.includes(item.id);

                return (
                  <Animated.View
                    key={String(item.id)}
                    layout={LinearTransition.duration(320)}
                    style={index > 0 ? styles.activitySpacer : undefined}
                  >
                    <ActivityBlock
                      id={item.id}
                      title={item.title ?? item.name ?? ""}
                      time_start={item.time_start ?? ""}
                      time_end={item.time_end ?? ""}
                      checkboxes={item.checkboxes}
                      isDetailed={isDetailed[String(item.id)] ?? false}
                      onToggleDetail={() => toggleDetailById(item.id)}
                      onDelete={(id) => id}
                      setIdToDelete={setIdToDelete}
                      setIsDeleteModalVisible={setIsDeleteModalVisible}
                      setIdToModify={setIdToModify}
                      setIsModifyModalVisible={setIsModifyModalVisible}
                      isSwipeable={true}
                      onCompletionChange={handleCompletionChange}
                      initialChecklistState={item.checklist_state}
                      initialCompleted={isCompleted}
                    />
                  </Animated.View>
                );
              })}
            </ThemedView>
          )}
        </ScrollView>
      </ThemedView>

      <Pressable
        style={styles.addActivityButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <CirclePlus size={40} color={colors.main} />
      </Pressable>

      {/* Modal for Statistics */}
      {isStatsVisible && (
        <StatsModal
          isVisible={isStatsVisible}
          onClose={() => setIsStatsVisible(false)}
          activities={activities}
          completedIds={completedActivityIds}
          dateLabel={formatLongDate(selectedDate)}
        />
      )}

      {/* Modal to add an activity to the day */}
      {isAddModalVisible && (
        <AddActivityModal
          isModalVisible={isAddModalVisible}
          setIsModalVisible={setIsAddModalVisible}
          setActivities={setActivities}
          availableActivities={masterActivities}
          currentUserId={user?.id ?? null}
          selectedDate={selectedDate}
        />
      )}

      {/* Modal to confirm deletion of an activity */}
      {isDeleteModalVisible && idToDelete !== null && (
        <DeleteActivityModal
          isModalVisible={isDeleteModalVisible}
          setIsModalVisible={setIsDeleteModalVisible}
          activityId={idToDelete}
          message="¿Estás seguro de que quieres eliminar esta actividad del día?"
          onAccept={async () => {
            setActivities(prev => prev.filter(a => a.id !== idToDelete));
            setCompletedActivityIds(prev => prev.filter(id => id !== idToDelete));
            setIsDeleteModalVisible(false);
            await removeDayActivityReminder(String(idToDelete));
            await removeDayActivityOntimeAlert(String(idToDelete));
            await deleteDayActivity(idToDelete);
          }}
        />
      )}

      {/* Modal to modify an activity */}
      {isModifyModalVisible && idToModify !== null && (
        <ModifyActivityModal
          isModalVisible={isModifyModalVisible}
          setIsModalVisible={setIsModifyModalVisible}
          id={idToModify}
          activities={activities}
          setActivities={setActivities}
          selectedDate={selectedDate}
        />
      )}
    </ThemedView>
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
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
      position: 'relative',
    },
    statsButton: {
      position: 'absolute',
      right: 5,
      top: -2, // Ajuste fino para centrar visualmente con el texto
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activitiesContainer: {
      marginTop: 20,
      paddingBottom: 80,
    },
    activitySpacer: {
      marginTop: 10,
    },
    body: {
      marginTop: 20,
      flex: 1,
    },
    dayScroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    addActivityButton: {
      position: 'absolute',
      bottom: 40,
      right: 20,
      borderRadius: 20,
    },
    mainTitle: {
      fontSize: 26,
      lineHeight: 30,
      marginBottom: 0,
    },
    spacer: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 5,
    },
    dayLoaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 60,
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      opacity: 0.8,
    },
    emptySubtext: {
      fontSize: 14,
      textAlign: 'center',
      opacity: 0.5,
      marginTop: 8,
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.light_accent,
    },
    sortButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.main,
    },
  });
