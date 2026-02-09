import { StyleSheet } from "react-native";
import { CirclePlus } from "lucide-react-native";

import UserHeader from "@/components/layout/user-header";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import ActivityBlock from "@/components/layout/activity-block";
import TodaysCalendar from "@/components/layout/todays-calendar";

import type { Activity } from "@/types";

const dummyData: Activity[] = [
  {
    id: 1,
    title: 'All',
    time_start: '9:00',
    end_time: '18:00',
    complete: false,
  },
  {
    id: 2,
    title: 'Work',
    time_start: '9:00',
    end_time: '13:00',
    complete: true,
  },
  {
    id: 3,
    title: 'College',
    time_start: '14:00',
    end_time: '17:00',
    complete: false,
  },
  {
    id: 4,
    title: 'Gym',
    time_start: '17:00',
    end_time: '18:00',
    complete: false,
  }
]

export default function ActivitiesScreen() {
  return (
    <ThemedView style={styles.mainContainer}>
      {/* Header */} 
      <UserHeader />

      <ThemedView style={styles.body}>
        <ThemedText type="title">Today's list</ThemedText>  

        {/* Calendar */}
        <TodaysCalendar/>

        {/* Today's activities */}
        <ThemedView style={styles.activitiesContainer}>
          {dummyData.map(activity => (
            <ActivityBlock
              key={activity.id}
              title={activity.title}
              time_start={activity.time_start}
              end_time={activity.end_time}
              complete={activity.complete}
            />
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.addActivityButton}>
        <CirclePlus size={40} color={'#8052c7'}/>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'column',
    gap: 10,
    padding: 15,
    marginTop: 40,
  },
  activitiesContainer: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 20,
  },
  body: {
    marginTop: 20,
  },
  addActivityButton: {
    position: 'absolute',
    bottom: -270,
    right: 20,
  }
})