import { StyleSheet, Pressable } from "react-native";
import * as Haptics from 'expo-haptics';

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";
import { getWeekDays, formatLongDate } from "@/utils/date";

type TodaysCalendarProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function TodaysCalendar({ selectedDate, onSelectDate }: TodaysCalendarProps) {
  const week = getWeekDays();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const today = new Date();
  const todayString = today.toDateString();

  const handleSelectDate = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate(date);
  };

  return (
    <ThemedView style={styles.container}>

      <ThemedView style={styles.daysContainer}>
        {week.map((dayItem, index) => {
          const isSelected = selectedDate.toDateString() === dayItem.date.toDateString();
          const isToday = todayString === dayItem.date.toDateString();
          return (
            <Pressable
              key={index}
              onPress={() => handleSelectDate(dayItem.date)}
              style={({ pressed }) => [
                styles.day,
                isToday && styles.today,
                !isToday && isSelected && styles.selectedDay,
                pressed && styles.dayPressed,
              ]}
            >
              <ThemedText type="defaultSemiBold">{dayItem.dayChar}</ThemedText>
              <ThemedText type="default">{dayItem.dayNumber}</ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      padding: 5,
    },
    daysContainer: {
      flexDirection: 'row',
      marginTop: 10,
      gap: 6,
    },
    today: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
    },
    selectedDay: {
      backgroundColor: colors.light_accent,
      borderRadius: 10,
    },
    dayPressed: {
      opacity: 0.7,
    },
    day: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      paddingVertical: 10,
    }
  })
