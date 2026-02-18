import { useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text"

import type { AddActivityModalProps, Activity } from "@/types"; 
// Reemplazar por datos de la base de datos
import { dummyData } from "@/data/dummy-activities";


export default function AddActivityModal({
  isModalVisible,
  setIsModalVisible,
  setActivities,
}: AddActivityModalProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleAddActivity = () => {
    if (!selectedActivity) return;

    const newActivity: Activity = {
      ...selectedActivity,
      id: Date.now(), // id simple temporal
      time_start: formatTime(startTime),
      time_end: formatTime(endTime),
    };

    setActivities((prev: Activity[]) => [...prev, newActivity]);

    // Reset state
    setSelectedActivity(null);
    setIsModalVisible(false);
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="fade"   // "none" | "slide" | "fade"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)} // obligatorio en Android
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <ThemedText type="subtitle">
            Add activity to today's checklist.
          </ThemedText>

          {/* Activity selector */}
          {!selectedActivity && (
            <ThemedView style={styles.activitiesContainer}>
              {dummyData.map(activity => (
                <Pressable
                  key={activity.id}
                  style={styles.activityOption}
                  onPress={() => setSelectedActivity(activity)}
                >
                  <ThemedText type="defaultSemiBold">
                    {activity.title}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}

          {/* Time range selector */}
          {selectedActivity && (
            <>
              <ThemedText>
                Selected: {selectedActivity.title}
              </ThemedText>

              <ThemedView style={styles.formContainer}>
                <ThemedView>
                  <ThemedText>Start</ThemedText>
                  <Pressable
                    style={styles.timeButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <ThemedText>{formatTime(startTime)}</ThemedText>
                  </Pressable>
                </ThemedView>

                <ThemedView>
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

          {/* Buttons */}
          <ThemedView style={styles.buttonsContainer}>
            <Pressable 
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <ThemedText>Close</ThemedText>
            </Pressable>
            
            <Pressable 
              style={styles.acceptButton}
              onPress={() => handleAddActivity()}
            >
              <ThemedText>Accept</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
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
    backgroundColor: "#c8a6ff",
  },
  buttonsContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "black",
  },
  formContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between",
  },
  timeButton: {
    marginTop: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#8052c7",
    alignItems: "center",
  }, 
  acceptButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#c8a6ff",
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "black",
    alignSelf: "center",
  },
})