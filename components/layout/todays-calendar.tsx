import { StyleSheet, Pressable } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";

type TodaysCalendarProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function TodaysCalendar({ selectedDate, onSelectDate }: TodaysCalendarProps) {
  const week = getWeek();
  const { colors } = useTheme();
  const styles = createStyles(colors); 

  const number = selectedDate.getDate();
  const day = selectedDate.toLocaleString('es-ES', { weekday: 'long' });
  const month = selectedDate.toLocaleString('es-ES', { month: 'long' });

  const today = new Date();
  const todayString = today.toDateString();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="default">{`${day}, ${month} ${number}`}</ThemedText>

      <ThemedView style={styles.daysContainer}>  
        {week.map((dayItem, index) => {
          const isSelected = selectedDate.toDateString() === dayItem.date.toDateString();
          const isToday = todayString === dayItem.date.toDateString();
          return (
            <Pressable
              key={index}
              onPress={() => onSelectDate(dayItem.date)}
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


function getWeek(): {
  dayChar: string;
  dayNumber: number;
  date: Date;
}[] {
  const today = new Date();
  const formatter = new Intl.DateTimeFormat('es-ES', { weekday: 'short' });

  const result: {
    dayChar: string;
    dayNumber: number;
    date: Date;
  }[] = [];

  for (let offset = -2; offset <= 4; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    let dayChar = formatter.format(date)[0].toUpperCase();
    if (date.getDay() === 3) {
      dayChar = 'X';
    }

    result.push({
      dayChar,
      dayNumber: date.getDate(),
      date,
    });
  }

  return result;
}


const createStyles = (colors: any) => 
  StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: 5,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  today: {
    backgroundColor: colors.secondary,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: 10,
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
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: 10,
  }
})