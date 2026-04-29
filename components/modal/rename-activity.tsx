import { useState, useEffect } from "react";
import { Modal, StyleSheet, TextInput } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/button";
import { updateActivityName } from "@/backend/activities";

import type { Activity, RenameActivityModalProps } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import { useActivities } from "@/context/ActivitiesContext";

export default function RenameActivityModal({
  isModalVisible,
  setIsModalVisible,
  activity,
  setActivities,
}: RenameActivityModalProps) {
  const [name, setName] = useState(activity.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setMasterActivities } = useActivities();

  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    if (isModalVisible) {
      setName(activity.name);
    }
  }, [isModalVisible, activity.id, activity.name]);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsModalVisible(false);
    setName(activity.name);
  };

  const handleRename = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;
    if (trimmedName === activity.name) {
      setIsModalVisible(false);
      return;
    }

    const id = String(activity.id);

    try {
      setIsSubmitting(true);
      const updated = await updateActivityName(id, trimmedName);
      if (!updated) {
        console.error("Error al actualizar el nombre de la actividad.");
        return;
      }

      const patch = (prev: Activity[]) =>
        prev.map((a) =>
          String(a.id) === id ? { ...a, name: trimmedName } : a
        );

      setActivities(patch);
      setMasterActivities(patch);
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
            Cambiar nombre de la actividad
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
              text="Guardar"
              style="main"
              onPress={handleRename}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
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
      width: "90%",
      backgroundColor: colors.background,
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
      color: colors.text,
      borderColor: colors.accent,
      backgroundColor: colors.background,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
  });
