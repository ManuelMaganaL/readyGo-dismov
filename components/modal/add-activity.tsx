import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, ScrollView, View } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text"
import Button from "@/components/ui/button";

import type { Activity } from "@/types";
import { upsertDayActivityReminder, upsertDayActivityOntimeAlert } from '@/utils/notifications';
import { addDayActivity } from "@/backend/day";
import { useTheme } from "@/context/ThemeContext";
import { formatToISODate } from "@/utils/date";

import type { AddToDayModalProps } from "@/types";
export default function AddActivityModal({
  isModalVisible,
  setIsModalVisible,
  setActivities,
  availableActivities,
  currentUserId,
  selectedDate,
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
      if (!currentUserId) return;
      if (selectedActivity.user_id !== currentUserId) return;

      const selectedIso = formatToISODate(selectedDate);
      const startTimeStr = formatTime(startTime);
      const endTimeStr = formatTime(endTime);

      const row = await addDayActivity(
        currentUserId,
        String(selectedActivity.id),
        selectedIso,
        startTimeStr,
        endTimeStr
      );

      if (!row) return;

      // Fix: Use the selected date instead of today's date
      const notificationDate = new Date(selectedDate);
      notificationDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      await upsertDayActivityReminder(
        String(row.id),
        "¡Prepárate para tu actividad!",
        `Tu actividad "${selectedActivity.name ?? selectedActivity.title}" comienza pronto. Revisa que lleves todo lo necesario.`,
        notificationDate
      );

      await upsertDayActivityOntimeAlert(
        String(row.id),
        selectedActivity.name ?? selectedActivity.title ?? '',
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
            Agrega una actividad a tu lista.
          </ThemedText>

          {!selectedActivity && (
            <ScrollView
              style={styles.scrollList}
              contentContainerStyle={styles.activitiesContainer}
              showsVerticalScrollIndicator={true}
            >
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
                  <ThemedText style={styles.optionText}>
                    {activity.name ?? activity.title}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {selectedActivity && (
            <>
              <ThemedText>
                Seleccionada: {selectedActivity.name ?? selectedActivity.title}
              </ThemedText>

              <View style={styles.formContainer}>
                <View style={styles.timeFieldContainer}>
                  <ThemedText>Inicio</ThemedText>
                  <Pressable
                    style={styles.timeButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <ThemedText>{formatTime(startTime)}</ThemedText>
                  </Pressable>
                </View>

                <View style={styles.timeFieldContainer}>
                  <ThemedText>Fin</ThemedText>
                  <Pressable
                    style={styles.timeButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <ThemedText>{formatTime(endTime)}</ThemedText>
                  </Pressable>
                </View>
              </View>

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

          <View style={styles.buttonsContainer}>
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
          </View>
        </ThemedView>
      </ThemedView>
    </Modal>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "92%",
      backgroundColor: colors.background,
      padding: 24,
      borderRadius: 24,
      gap: 20,
      borderWidth: 1,
      borderColor: colors.light_accent,
    },
    scrollList: {
      maxHeight: 410,
      flexGrow: 0,
    },
    activitiesContainer: {
      flexDirection: "column",
      gap: 12,
    },
    activityOption: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.main + '80',
    },
    optionText: {
      fontSize: 15,
      fontWeight: '600',
      opacity: 0.9,
    },
    buttonsContainer: {
      marginTop: 0,
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