import { useState } from "react";
import { Modal, StyleSheet, TextInput } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/button";
import { addActivity } from "@/backend/activities";
import { getSessionInfo } from "@/backend/session";

import type { AddActivityModalProps, Activity } from "@/types";
import { LIGHT_ACCENT_COLOR } from "@/constants/theme";


export default function CreateActivityModal({
  isModalVisible,
  setIsModalVisible,
  setActivities,
}: AddActivityModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsModalVisible(false);
    setName("");
  };

  const handleCreateActivity = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const sessionUser = await getSessionInfo();
      if (!sessionUser?.id) {
        console.error("No se encontró una sesión de usuario activa.");
        return;
      }

      const created = await addActivity(sessionUser.id, trimmedName);
      if (!created) {
        console.error("Error al crear la actividad.");
        return;
      }

      const newActivity: Activity = {
        id: created.id,
        user_id: created.user_id,
        name: created.name,
        created_at: created.created_at,
        checkboxes: [],
      };

      setActivities((prev: Activity[]) => [...prev, newActivity]);
      setName("");
      setIsModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <ThemedText type="subtitle">
            Crea una nueva actividad
          </ThemedText>

          <ThemedView>
            <ThemedText>Nombre de la actividad:</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Ej. Escuela"
              value={name}
              onChangeText={setName}
              editable={!isSubmitting}
            />
          </ThemedView>

          <ThemedView style={styles.buttonsContainer}>
            <Button
              text="Cerrar"
              style="secondary"
              onPress={handleClose}
            />

            <Button
              text="Crear"
              style="main"
              onPress={handleCreateActivity}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
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
  input: {
    fontSize: 15,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LIGHT_ACCENT_COLOR,
    backgroundColor: "white",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
})
