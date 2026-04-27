import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "@/context/ThemeContext";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import LoaderSpinner from "@/components/loader-spinner";
import UserHeader from "@/components/layout/user-header";
import DayColumn from "@/components/layout/day-column";
import TimeColumn from "@/components/layout/time-column";
import { getSessionInfo, getUserInfo } from "@/backend/session";

import { fetchTodayDayActivities } from "@/backend/day";
import { useActivities } from "@/context/ActivitiesContext";
import type { Activity, User } from "@/types";


type DayKey = "today" | "tomorrow";

export default function CalendarTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [user, setUser] = useState<User | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayKey>("today");
  
  const [isLoading, setIsLoading] = useState(true);
  const { masterActivities, isLoadingActivities } = useActivities();

  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);
  const [tomorrowActivities, setTomorrowActivities] = useState<Activity[]>([]);

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

  useFocusEffect(
    useCallback(() => {
      loadUser(true);
    }, [loadUser])
  );

  useEffect(() => {
    if (!user?.id || isLoadingActivities) return;

    let cancelled = false;

    const toISODate = (d: Date) => d.toISOString().split("T")[0];

    const buildScheduledActivities = (rows: Awaited<ReturnType<typeof fetchTodayDayActivities>>): Activity[] => {
      const safeRows = rows ?? [];
      return safeRows.map((row) => {
        const base = masterActivities.find((a) => String(a.id) === String(row.activity_id));
        return {
          id: row.id, // day_activity row id
          user_id: row.user_id,
          activity_id: row.activity_id, // base activity id (used for navigation)
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
    };

    const loadCalendar = async () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const [todayRows, tomorrowRows] = await Promise.all([
        fetchTodayDayActivities(user.id, toISODate(today)),
        fetchTodayDayActivities(user.id, toISODate(tomorrow)),
      ]);

      if (cancelled) return;

      setTodayActivities(buildScheduledActivities(todayRows));
      setTomorrowActivities(buildScheduledActivities(tomorrowRows));
    };

    loadCalendar().catch((err) => console.error("Error loading calendar:", err));

    return () => {
      cancelled = true;
    };
  }, [user?.id, isLoadingActivities, masterActivities]);

  return (
    <>
      {isLoading ? (
        <LoaderSpinner/>
      ) : (
        <ThemedView style={styles.mainContainer}>
          <UserHeader user={user!}/>
    
          <ThemedView style={styles.body}>
            <ThemedText type="title">Calendario</ThemedText>
    
            <ScrollView
              style={styles.calendarScroll}
              showsVerticalScrollIndicator={true}
            >
              <ThemedView style={[
                  styles.calendarRow,
                  { backgroundColor: colors.danger }
                ]}>
                <TimeColumn />
                
                <ThemedView style={[
                    styles.daysRow,
                    { backgroundColor: colors.background }
                  ]}>
                  {/* Dejar que el usuario haga scroll lateral para ver mas dias */}
                  {/* Agregar un boton para que te lleve al dia de hoy */}
                  <DayColumn
                    dayKey="today"
                    activities={todayActivities}
                    isSelected={selectedDay === "today"}
                    onSelect={() => setSelectedDay("today")}
                  />
                  <DayColumn
                    dayKey="tomorrow"
                    activities={tomorrowActivities}
                    isSelected={selectedDay === "tomorrow"}
                    onSelect={() => setSelectedDay("tomorrow")}
                  />
                </ThemedView>
              </ThemedView>
            </ScrollView>
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
    gap: 10,
    padding: 15,
    marginTop: 40,
  },
  body: {
    marginTop: 20,
    flex: 1,
  },
  weekStrip: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  weekDayChip: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  weekDayChipSelected: {
    backgroundColor: colors.main,
  },
  weekDayChipTextSelected: {
    color: "#fff",
  },
  calendarScroll: {
    marginTop: 20,
    flex: 1,
  },
  calendarRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  daysRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
});
