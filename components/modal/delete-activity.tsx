import { Modal, Pressable, StyleSheet } from "react-native"

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text"
import Button from "@/components/ui/button";

import type { Activity, DeleteActivityModalProps } from "@/types"; 


export default function DeleteActivityModal({
  isModalVisible,
  setIsModalVisible,
  id,
  setActivities,
}: DeleteActivityModalProps) {
  const handleAccept = (id: number) => {
    setIsModalVisible(false);
    setActivities((prev: Activity[]) => prev.filter(activity => activity.id !== id));
  }

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
            Are you sure you want to delete this activity from today's checklist?
          </ThemedText>

          {/* Buttons */}
          <ThemedView style={styles.buttonsContainer}>
            <Button
              text="Cerrar"
              style="secondary"
              onPress={() => setIsModalVisible(false)}
            />
            
            <Button
              text="Aceptar"
              style="danger"
              onPress={() => handleAccept(id)}
            />
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
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  }
})