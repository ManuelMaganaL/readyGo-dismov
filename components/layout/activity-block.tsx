import { useState } from "react";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { StyleSheet, Pressable, View } from "react-native";
import { SquarePen, Trash2 } from "lucide-react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";
import { useActivities } from "@/context/ActivitiesContext";
import DeleteActivityModal from "@/components/modal/delete-activity";
import RenameActivityModal from "@/components/modal/rename-activity";

import { deleteActivity } from "@/backend/activities";

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
  const { colors } = useTheme();
  const { setMasterActivities } = useActivities();
  const styles = createStyles(colors);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);

  const renderRightActions = () => {
    return (
      <View style={styles.swipeActions}>
        <Pressable
          style={styles.swipeActionButton}
          onPress={() => setIsRenameModalVisible(true)}
        >
          <SquarePen size={24} color={colors.icon} />
        </Pressable>
        <Pressable
          style={styles.swipeActionButton}
          onPress={() => setIsDeleteModalVisible(true)}
        >
          <Trash2 size={24} color={colors.danger} />
        </Pressable>
      </View>
    );
  };

  const handleDeleteActivity = async () => {
    const deletedActivity = await deleteActivity(String(activity.id));
    if (!deletedActivity) {
      console.error("Error al eliminar la actividad");
      return;
    }
    setActivities(prev => prev.filter(act => act.id !== activity.id));
    setMasterActivities(prev => prev.filter(act => act.id !== activity.id));
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
        <ThemedView
          style={[styles.container, { backgroundColor: colors.secondary }]}
        >
          <ThemedText type="defaultSemiBold">{activity.name}</ThemedText>
        </ThemedView>
      </Pressable>

      <RenameActivityModal
        isModalVisible={isRenameModalVisible}
        setIsModalVisible={setIsRenameModalVisible}
        activity={activity}
        setActivities={setActivities}
      />

      <DeleteActivityModal
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        activityId={String(activity.id)}
        message={"¿Estás seguro de que quieres eliminar esta actividad?"}
        onAccept={handleDeleteActivity}
      />
    </Swipeable>
  )
}


const createStyles = (colors: any) =>
   StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: colors.secondary,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.main,
    marginVertical: 5,
  },
  swipeActions: {
    flexDirection: "row",
    height: "100%",
  },
  swipeActionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    height: "100%",
  },
})
