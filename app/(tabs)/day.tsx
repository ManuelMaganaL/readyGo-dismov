import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, ScrollView, View } from "react-native";
import { CirclePlus } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";

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

import { getSessionInfo, getUserInfo } from "@/backend/session";
import {
  fetchTodayDayActivities,
  deleteDayActivity,
  updateDayActivityCompletion,
} from "@/backend/day";

import type { Activity, User } from "@/types";
import { useActivities } from "@/context/ActivitiesContext";
import { sendCompletionNotification, removeDayActivityReminder } from "@/utils/notifications";

export default function DayTab() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { masterActivities, isLoadingActivities } = useActivities();
  const hasFetchedDayActivities = useRef(false);

  const loadUser = useCallback(async () => {
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
  }, [router]);

  // 1: Cargar usuario
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  // 2: Cargar actividades del dia desde Supabase (una sola vez)
  useEffect(() => {
    if (!user || isLoadingActivities || hasFetchedDayActivities.current) return;
    hasFetchedDayActivities.current = true;

    const loadTodayActivities = async () => {
      const today = new Date().toISOString().split('T')[0];
      const rows = await fetchTodayDayActivities(user.id, today);

      if (rows && rows.length > 0) {
        const built: Activity[] = rows.map(row => {
          const base = masterActivities.find(a => String(a.id) === row.activity_id);
          return {
            id: row.id,
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
          };
        });

        const completedIds = rows.filter(r => r.is_completed).map(r => r.id);
        setActivities(built);
        setCompletedActivityIds(completedIds);
      }

      setIsLoading(false);
    };

    loadTodayActivities();
  }, [user?.id, isLoadingActivities]);

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

  const getMinutesFromTime = (time?: string) => {
    if (!time) return Number.MAX_SAFE_INTEGER;
    const [hours, minutes] = time.split(":");
    const parsedHours = Number(hours);
    const parsedMinutes = Number(minutes);

    if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) {
      return Number.MAX_SAFE_INTEGER;
    }

    return parsedHours * 60 + parsedMinutes;
  };

  const compareByTimeThenName = (a: Activity, b: Activity) => {
    const aStartMinutes = getMinutesFromTime(a.time_start);
    const bStartMinutes = getMinutesFromTime(b.time_start);

    if (aStartMinutes !== bStartMinutes) return aStartMinutes - bStartMinutes;

    const aEndMinutes = getMinutesFromTime(a.time_end);
    const bEndMinutes = getMinutesFromTime(b.time_end);

    if (aEndMinutes !== bEndMinutes) return aEndMinutes - bEndMinutes;

    const aName = (a.title ?? a.name ?? "").trim();
    const bName = (b.title ?? b.name ?? "").trim();
    return aName.localeCompare(bName, "es", { sensitivity: "base" });
  };

  const compareForPending = (a: Activity, b: Activity) => {
    const aIdx = a.order_index ?? 9999;
    const bIdx = b.order_index ?? 9999;
    if (aIdx !== bIdx) return aIdx - bIdx;
    return compareByTimeThenName(a, b);
  };

  const orderedActivities = [
    ...activities
      .filter(activity => !completedActivityIds.includes(activity.id))
      .sort(compareForPending),
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
      .catch(err => console.error("Error persisting completion:", err));
    // Notificación al completar
    if (completed) {
      const activity = activities.find(a => a.id === activityId);
      const actName = activity?.title ?? activity?.name ?? "";
      sendCompletionNotification(actName).catch(() => {});
    }
  };

  return (
    <>
      {isLoading ? (
        <LoaderSpinner/>
      ) : (
        <ThemedView style={styles.mainContainer}>
          {/* Header */} 
          <UserHeader user={user!}/>

          <ThemedView style={styles.body}>
            <ThemedText type="title">Hoy</ThemedText>  

            {/* Calendar */}
            <TodaysCalendar/>

            {/* Today's activities */}
            <ScrollView
              style={styles.dayScroll}
              showsVerticalScrollIndicator={true}
            >
              <ThemedView style={styles.activitiesContainer}>
                {orderedActivities.map((item, index) => {
                  const isCompleted = completedActivityIds.includes(item.id);

                  return (
                    <View key={String(item.id)} style={index > 0 ? styles.activitySpacer : undefined}>
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
                    </View>
                  );
                })}
              </ThemedView>
            </ScrollView>
          </ThemedView>

          <Pressable
            style={styles.addActivityButton}
            onPress={() => setIsAddModalVisible(true)}
          >
            <CirclePlus size={40} color={colors.main}/>
          </Pressable>
          
          {/* Modal to add an activity to the day */}
          {isAddModalVisible && (
            <AddActivityModal
              isModalVisible={isAddModalVisible}
              setIsModalVisible={setIsAddModalVisible}
              setActivities={setActivities}
              availableActivities={masterActivities}
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
            />
          )}
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
  addActivityButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    borderRadius: 20,
  },  
  dayScroll: {
    flex: 1,
  },
});
