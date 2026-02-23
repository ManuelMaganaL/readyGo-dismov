import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, ScrollView } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import LoaderSpinner from "@/components/loader-spinner";
import UserHeader from "@/components/layout/user-header";
import DayColumn from "@/components/layout/day-column";
import TimeColumn from "@/components/layout/time-column";
import { getSessionInfo, getUserInfo } from "@/backend/session";

import { calendarTodayDummy, calendarTomorrowDummy } from "@/data/dummy-calendar";
import type { User } from "@/types";
import { MAIN_COLOR } from "@/constants/theme";


type DayKey = "today" | "tomorrow";

export default function CalendarTab() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayKey>("today");
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isLogedIn = async () => {
      setIsLoading(true);
      const sessionInfo = await getSessionInfo();
      if (!sessionInfo) {
        router.push("/auth/login");
        return;
      }

      const userInfo = await getUserInfo(sessionInfo.id);
      if (!userInfo) {
        router.push("/auth/login");
        return;
      } else {
        setUser({id: userInfo.id, username: userInfo.username, email: userInfo.email, created_at: userInfo.created_at});
      }

      setIsLoading(false);
    }
    isLogedIn();
  }, []);

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
              <ThemedView style={styles.calendarRow}>
                <TimeColumn />
                
                <ThemedView style={styles.daysRow}>
                  {/* Dejar que el usuario haga scroll lateral para ver mas dias */}
                  {/* Agregar un boton para que te lleve al dia de hoy */}
                  <DayColumn
                    dayKey="today"
                    activities={calendarTodayDummy}
                    isSelected={selectedDay === "today"}
                    onSelect={() => setSelectedDay("today")}
                  />
                  <DayColumn
                    dayKey="tomorrow"
                    activities={calendarTomorrowDummy}
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

const styles = StyleSheet.create({
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
    backgroundColor: MAIN_COLOR,
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
