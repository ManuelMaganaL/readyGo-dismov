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
}: ActivityBlockProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { setMasterActivities } = useActivities();
  const styles = createStyles(colors);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);

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
    <ThemedView style={styles.cardWrapper}>
      <Pressable
        onPress={() => router.push(`/activities/${activity.id}`)}
        onLongPress={() => setIsRenameModalVisible(true)}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed
        ]}
      >
        <View style={styles.nameRow}>
          <ThemedText style={styles.activityName} numberOfLines={2}>
            {activity.name}
          </ThemedText>
          <Pressable onPress={() => setIsDeleteModalVisible(true)} hitSlop={15} style={styles.deleteBtn}>
            <Trash2 size={16} color={colors.danger} opacity={0.6} />
          </Pressable>
        </View>

        <View style={styles.cardFooter}>
          <ThemedText style={styles.itemCount}>
            {activity.checkboxes?.length || 0} subtareas
          </ThemedText>
          <SquarePen size={14} color={colors.light_accent} />
        </View>
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
    </ThemedView>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    cardWrapper: {
      marginBottom: 4,
    },
    container: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.light_accent,
      height: 80,
      justifyContent: 'space-between',
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    nameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
    },
    activityName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
    },
    deleteBtn: {
      paddingTop: 2,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    itemCount: {
      fontSize: 12,
      opacity: 0.5,
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
  });
