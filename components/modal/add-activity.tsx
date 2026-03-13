import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text"
import Button from "@/components/ui/button";

import type { Activity } from "@/types"; 
import { upsertDayActivityReminder } from '@/utils/notifications';
import { addDayActivity } from "@/backend/day";
import { getSessionInfo } from "@/backend/session";
import { useTheme } from "@/context/ThemeContext";

import type { AddToDayModalProps } from "@/types";
export default function AddActivityModal({
  isModalVisible,
  setIsModalVisible,
  setActivities,
  availableActivities,
  currentUserId,
}: AddToDayModalProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const userActivities = useMemo(() => {
    if (!currentUserId) return [];
    return availableActivities.filter(activity => activity.user_id === currentUserId);
  }, [availableActivities, currentUserId]);

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleAddActivity = async () => {
    if (!selectedActivity || isSaving) return;
    setIsSaving(true);

    try {
      const sessionInfo = await getSessionInfo();
      if (!sessionInfo) return;
      if (selectedActivity.user_id !== sessionInfo.id) return;

      const today = new Date().toISOString().split('T')[0];
      const startTimeStr = formatTime(startTime);
      const endTimeStr = formatTime(endTime);

      const row = await addDayActivity(
        sessionInfo.id,
        String(selectedActivity.id),
        today,
        startTimeStr,
        endTimeStr
      );

      if (!row) return;

      const notificationDate = new Date();
      notificationDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      await upsertDayActivityReminder(
        String(row.id),
        "¡Prepárate para tu actividad!",
        `Tu actividad "${selectedActivity.name ?? selectedActivity.title}" comienza pronto. Revisa que lleves todo lo necesario.`,
        notificationDate
      );

      const newActivity: Activity = {
        ...selectedActivity,
        id: row.id,
        activity_id: String(selectedActivity.id),
        title: selectedActivity.name ?? selectedActivity.title,
        time_start: row.start_time,
        time_end: row.end_time,
        checklist_state: [],
      };

      setActivities((prev: Activity[]) => [...prev, newActivity]);
      setSelectedActivity(null);
      setIsModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <ThemedText type="subtitle">
            Add activity to today's checklist.
          </ThemedText>

          {!selectedActivity && (
            <ThemedView style={styles.activitiesContainer}>
              {!currentUserId ? (
                <ThemedText type="default">Cargando actividades...</ThemedText>
              ) : userActivities.length === 0 ? (
                <ThemedText type="default">No tienes actividades. Crea una en la pestaña Actividades.</ThemedText>
              ) : userActivities.map(activity => (
                <Pressable
                  key={activity.id}
                  style={styles.activityOption}
                  onPress={() => setSelectedActivity(activity)}
                >
                  <ThemedText type="defaultSemiBold">
                    {activity.name ?? activity.title}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}

          {selectedActivity && (
            <>
              <ThemedText>
                Seleccionada: {selectedActivity.name ?? selectedActivity.title}
              </ThemedText>

              <ThemedView style={styles.formContainer}>
                <ThemedView style={styles.timeFieldContainer}>
                  <ThemedText>Start</ThemedText>
                  <Pressable
                    style={styles.timeButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <ThemedText>{formatTime(startTime)}</ThemedText>
                  </Pressable>
                </ThemedView>

                <ThemedView style={styles.timeFieldContainer}>
                  <ThemedText>End</ThemedText>
                  <Pressable
                    style={styles.timeButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <ThemedText>{formatTime(endTime)}</ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>

              {showStartPicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onChange={(event, date) => {
                    setShowStartPicker(false);
                    if (event.type === "dismissed") return;
                    if (date) setStartTime(date);
                  }}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="default"
                  onChange={(event, date) => {
                    setShowEndPicker(false);
                    if (event.type === "dismissed") return;
                    if (date) setEndTime(date);
                  }}
                />
              )}
            </>
          )}

          <ThemedView style={styles.buttonsContainer}>
            <Button
              text="Cerrar"
              style="secondary"
              onPress={() => setIsModalVisible(false)}
            />

            <Button
              text={isSaving ? "Guardando..." : "Aceptar"}
              style="main"
              onPress={() => handleAddActivity()}
              disabled={!selectedActivity || isSaving}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  )
}

const createStyles = (colors:any) => 
StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 12,
    gap: 20,
  },
  activitiesContainer: {
    flexDirection: "column",
    gap: 15,
  },
  activityOption: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: colors.secondary,
  },
  buttonsContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  formContainer: { 
    flexDirection: "row", 
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  timeFieldContainer: {
    width: "44%",
  },
  timeButton: {
    marginTop: 5,
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: colors.secondary,
    alignItems: "center",
  }
})