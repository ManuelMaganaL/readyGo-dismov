import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Pressable, StyleSheet } from "react-native"

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text"
import Button from "@/components/ui/button";

import type { Activity, ModifyActivityModalProps } from "@/types"; 
import { upsertDayActivityReminder } from "@/utils/notifications";
import { updateDayActivityTimes } from "@/backend/day";
import { useTheme } from "@/context/ThemeContext";

export default function ModifyActivityModal({
  isModalVisible,
  setIsModalVisible,
  id,
  activities,
  setActivities,
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

  const handleStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);

    if (event.type === "dismissed") return;
    if (selectedDate) setStartTime(selectedDate);
  };
    
  const handleEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);

    if (event.type === "dismissed") return;
    if (selectedDate) setEndTime(selectedDate);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };
  
  const handleAccept = async (id: string | number) => {
    if (endTime <= startTime) {
      alert("End time must be after start time");
      return;
    }
  
    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);

    const notificationDate = new Date();
    notificationDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    await upsertDayActivityReminder(
      String(id),
      "¡Prepárate para tu actividad!",
      `Tu actividad "${activity.title}" comienza pronto. Revisa que lleves todo lo necesario.`,
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
            Select the new time range for the activity {activity.title}.
          </ThemedText>

          {/* Time range selector */}
          <ThemedView style={styles.formContainer}>
            {/* START */}
            <ThemedView style={styles.timeFieldContainer}>
              <ThemedText>Start</ThemedText>
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
            </ThemedView>

            {/* END */}
            <ThemedView style={styles.timeFieldContainer}>
              <ThemedText>End</ThemedText>
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
            </ThemedView>
          </ThemedView>

          {/* Buttons */}
          <ThemedView style={styles.buttonsContainer}>
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
    marginTop: 5,
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: colors.mid_accent,
    alignItems: "center",
  },  
})