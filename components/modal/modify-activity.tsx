import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Pressable, StyleSheet, View } from "react-native"

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text"
import Button from "@/components/ui/button";

import type { Activity, ModifyActivityModalProps } from "@/types";
import { upsertDayActivityReminder, upsertDayActivityOntimeAlert } from "@/utils/notifications";
import { updateDayActivityTimes } from "@/backend/day";
import { useTheme } from "@/context/ThemeContext";

export default function ModifyActivityModal({
  isModalVisible,
  setIsModalVisible,
  id,
  activities,
  setActivities,
  selectedDate,
}: ModifyActivityModalProps) {
  const activity = activities.find(act => act.id === id)!;

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [startTime, setStartTime] = useState<Date>(new Date(`1970-01-01T${activity.time_start}:00`));
  const [endTime, setEndTime] = useState<Date>(new Date(`1970-01-01T${activity.time_end}:00`));

  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    const current = activities.find(act => act.id === id);
    if (!current) return;

    setStartTime(new Date(`1970-01-01T${current.time_start}:00`));
    setEndTime(new Date(`1970-01-01T${current.time_end}:00`));
  }, [id, activities]);

  const handleStartChange = (event: any, selectedDatePicker?: Date) => {
    setShowStartPicker(false);

    if (event.type === "dismissed") return;
    if (selectedDatePicker) setStartTime(selectedDatePicker);
  };

  const handleEndChange = (event: any, selectedDatePicker?: Date) => {
    setShowEndPicker(false);

    if (event.type === "dismissed") return;
    if (selectedDatePicker) setEndTime(selectedDatePicker);
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleAccept = async (id: string | number) => {
    if (endTime <= startTime) {
      alert("La hora de fin debe ser después de la hora de inicio");
      return;
    }

    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);

    // Fix: Use the selectedDate instead of today's date
    const notificationDate = new Date(selectedDate);
    notificationDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    await upsertDayActivityReminder(
      String(id),
      "¡Prepárate para tu actividad!",
      `Tu actividad "${activity.title}" comienza pronto. Revisa que lleves todo lo necesario.`,
      notificationDate
    );

    await upsertDayActivityOntimeAlert(
      String(id),
      activity.title ?? '',
      notificationDate
    );

    setIsModalVisible(false);

    const modifiedActivity: Activity = {
      ...activity,
      time_start: startTimeStr,
      time_end: endTimeStr,
    };

    setActivities((prev: Activity[]) =>
      prev.map(act => act.id === id ? modifiedActivity : act)
    );

    await updateDayActivityTimes(String(id), startTimeStr, endTimeStr);
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
            Selecciona el nuevo rango de tiempo para la actividad {activity.title}.
          </ThemedText>

          {/* Time range selector */}
          <View style={styles.formContainer}>
            {/* START */}
            <View style={styles.timeFieldContainer}>
              <ThemedText>Inicio</ThemedText>
              <Pressable
                style={styles.timeButton}
                onPress={() => setShowStartPicker(true)}
              >
                <ThemedText>{formatTime(startTime)}</ThemedText>
              </Pressable>

              {showStartPicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onChange={handleStartChange}
                />
              )}
            </View>

            {/* END */}
            <View style={styles.timeFieldContainer}>
              <ThemedText>Fin</ThemedText>
              <Pressable
                style={styles.timeButton}
                onPress={() => setShowEndPicker(true)}
              >
                <ThemedText>{formatTime(endTime)}</ThemedText>
              </Pressable>

              {showEndPicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="default"
                  onChange={handleEndChange}
                />
              )}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Button
              text="Cerrar"
              style="secondary"
              onPress={() => setIsModalVisible(false)}
            />

            <Button
              text="Aceptar"
              style="main"
              onPress={() => handleAccept(id)}
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
      backgroundColor: colors.card,
      padding: 24,
      borderRadius: 24,
      gap: 20,
      borderWidth: 1,
      borderColor: colors.light_accent,
    },
    buttonsContainer: {
      marginTop: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    acceptButton: {
      alignSelf: "flex-end",
      paddingVertical: 4,
      paddingHorizontal: 10,
      backgroundColor: colors.secondary,
      borderWidth: 1,
      borderRadius: 6,
      borderColor: colors.tint,
    },
    closeButton: {
      alignSelf: "flex-end",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderRadius: 6,
      borderColor: colors.tint,
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
      marginTop: 8,
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderRadius: 12,
      borderColor: colors.light_accent,
      backgroundColor: colors.background,
      alignItems: "center",
    },
  })