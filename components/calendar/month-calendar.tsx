import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { getMonthDays, formatMonthYear } from '@/utils/date';

interface MonthCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onDayPress: (date: Date) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  colors: any;
}

export function MonthCalendar({
  selectedDate,
  onSelectDate,
  onDayPress,
  goToPreviousMonth,
  goToNextMonth,
  colors,
}: MonthCalendarProps) {
  const styles = createStyles(colors);
  const days = getMonthDays(selectedDate);

  return (
    <ThemedView style={styles.monthCalendar}>
      <View style={styles.monthHeader}>
        <Pressable onPress={goToPreviousMonth} style={({ pressed }) => [styles.monthNavButton, pressed && styles.monthNavButtonPressed]}>
          <ThemedText style={styles.monthNavText}>‹</ThemedText>
        </Pressable>
        <ThemedText type="title" style={styles.monthTitle}>
          {formatMonthYear(selectedDate)}
        </ThemedText>
        <Pressable onPress={goToNextMonth} style={({ pressed }) => [styles.monthNavButton, pressed && styles.monthNavButtonPressed]}>
          <ThemedText style={styles.monthNavText}>›</ThemedText>
        </Pressable>
      </View>
      <View style={styles.weekHeader}>
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((label) => (
          <ThemedText key={label} type="default" style={styles.weekdayLabel}>
            {label}
          </ThemedText>
        ))}
      </View>
      <View style={styles.monthGrid}>
        {days.map((dayItem) => {
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
                onSelectDate(dayItem.date);
                onDayPress(dayItem.date);
              }}
            >
              <ThemedText style={styles.monthDayNumber}>{dayItem.dayNumber}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    monthCalendar: {
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 0,
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
      textTransform: "capitalize",
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
      width: "13.5%",
      fontSize: 14,
      fontWeight: "bold",
      textAlign: "center",
      opacity: 0.7,
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: -8,
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
      fontSize: 13.5,
      textAlign: "center",
      includeFontPadding: false,
      textAlignVertical: "center",
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
