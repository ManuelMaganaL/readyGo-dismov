import { StyleSheet } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { LIGHT_ACCENT_COLOR, SECONDARY_COLOR } from "@/constants/theme";

export default function TodaysCalendar() {
  const week = getWeek();

  const number = week[2].dayNumber;
  const day = new Date().toLocaleString('en-US', { weekday: 'long' });
  const month = new Date().toLocaleString('en-US', { month: 'long' });

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="default">{`${day}, ${month} ${number}`}</ThemedText>

      <ThemedView style={styles.daysContainer}>  
        {week.map((day, index) => (
          <ThemedView key={index} style={day.today ? styles.today : styles.day}>
            <ThemedText type="defaultSemiBold">{day.dayChar}</ThemedText>
            <ThemedText type="default">{day.dayNumber}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  )
}


function getWeek(): {
  dayChar: string,
  dayNumber: number,
  today: boolean,
}[] {
  const today = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

  const result: { 
    dayChar: string, 
    dayNumber: number,
    today: boolean, 
  }[] = [];

  for (let offset = -2; offset <= 4; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    result.push({
      dayChar: formatter.format(date)[0].toUpperCase(),
      dayNumber: date.getDate(),
      today: offset === 0,
    });
  }

  return result;
}


const styles = StyleSheet.create({
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
    backgroundColor: SECONDARY_COLOR,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: 10,
    borderRadius: 10,
  },
  day: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: 10,
  }
})