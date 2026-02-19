import { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import UserHeader from "@/components/layout/user-header";
import DayColumn from "@/components/layout/day-column";
import TimeColumn from "@/components/layout/time-column";

import { calendarTodayDummy, calendarTomorrowDummy } from "@/data/dummy-calendar";

const START_HOUR = 6;
const END_HOUR = 24;
const HOUR_HEIGHT = 56;

type DayKey = "today" | "tomorrow";

export default function CalendarScreen() {
  const [selectedDay, setSelectedDay] = useState<DayKey>("today");

  return (
    <ThemedView style={styles.mainContainer}>
      <UserHeader />

      <ThemedView style={styles.body}>
        <ThemedText type="title">Calendario</ThemedText>

        <ScrollView
          style={styles.calendarScroll}
          contentContainerStyle={styles.calendarScrollContent}
          showsVerticalScrollIndicator={true}
        >
          <ThemedView style={styles.calendarRow}>
            <TimeColumn />
            <ThemedView style={styles.daysRow}>
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
    backgroundColor: "#8052c7",
  },
  weekDayChipTextSelected: {
    color: "#fff",
  },
  calendarScroll: {
    marginTop: 20,
    flex: 1,
  },
  calendarScrollContent: {
    paddingBottom: 24,
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
