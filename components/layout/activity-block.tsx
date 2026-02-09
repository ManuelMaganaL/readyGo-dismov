import { StyleSheet } from "react-native";
import { CircleDashed, CircleCheckBig, ChevronDown } from "lucide-react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

import type { ActivityBlockProps } from "@/types/index";

export default function ActivityBlock({
  title,
  time_start,
  end_time,
  complete,
}: ActivityBlockProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.timeContainer}>
        {/* Show details button */}
        <ChevronDown size={20}/>

        {/* Time */}
        <ThemedText type="defaultSemiBold">{`${time_start} - ${end_time}`}</ThemedText>
      </ThemedView>
      
      {/* Activity name */}
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      
      {/* Status */}
      {complete ? (
        <CircleCheckBig size={20} color={'#8052c7'}/>
      ) : (
        <CircleDashed size={20} color={'#4f4f4f'}/>
      )}
    </ThemedView>
  )
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
    height: 50,
    width: '100%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#c7c7c7',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
})