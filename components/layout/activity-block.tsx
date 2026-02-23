import { useState } from "react";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { StyleSheet, Pressable } from "react-native";
import { SquarePen, Trash2 } from "lucide-react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import DeleteActivityModal from "@/components/modal/delete-activity";

import { deleteActivity } from "@/backend/activities";

import { SECONDARY_COLOR, MAIN_COLOR, DANGER_COLOR } from "@/constants/theme";
import type { Activity } from "@/types";

export interface ActivityBlockProps {
  activity: Activity;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

export default function ActivityBlock({
  activity,
  setActivities,
}: ActivityBlockProps)  {
  const router = useRouter();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const renderRightActions = () => {
    return (
      <Pressable 
        style={styles.deleteButton} 
        onPress={() => setIsDeleteModalVisible(true)}
      >
        <Trash2 size={24} color={DANGER_COLOR} />
      </Pressable>
    )
  }

  const handleDeleteActivity = async () => {
    const deletedActivity = await deleteActivity(activity.id);
    if (!deletedActivity) {
      console.error("Error al eliminar la actividad");
      return;
    }
    setActivities(prev => prev.filter(act => act.id !== activity.id));
    setIsDeleteModalVisible(false);
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
    > 
      <Pressable
        onPress={() => router.push(`/activities/${activity.id}`)}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="defaultSemiBold">{activity.name}</ThemedText>
          <SquarePen color={MAIN_COLOR} />
        </ThemedView>
      </Pressable>   

      <DeleteActivityModal 
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        activityId={activity.id}
        message={"¿Estás seguro de que quieres eliminar esta actividad?"}
        onAccept={handleDeleteActivity}
      />
    </Swipeable>
  )
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '100%',
    borderRadius: 10,
    backgroundColor: SECONDARY_COLOR,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: MAIN_COLOR,
    marginVertical: 5,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
})
