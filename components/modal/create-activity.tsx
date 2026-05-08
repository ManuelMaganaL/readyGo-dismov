import { useState } from "react";
import { Modal, StyleSheet, TextInput, View, Pressable } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/button";
import { addActivity } from "@/backend/activities";
import { useUser } from "@/context/UserContext";

import type { AddActivityModalProps, Activity } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import { useActivities } from "@/context/ActivitiesContext";

export default function CreateActivityModal({
  isModalVisible,
  setIsModalVisible,
  setActivities,
}: AddActivityModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const { setMasterActivities } = useActivities();

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsModalVisible(false);
    setName("");
  };

  const handleCreateActivity = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting || !user?.id) return;

    try {
      setIsSubmitting(true);

      const created = await addActivity(user.id, trimmedName);
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
      setMasterActivities((prev: Activity[]) => {
        if (prev.some(activity => activity.id === newActivity.id)) return prev;
        return [...prev, { ...newActivity, checkboxes: newActivity.checkboxes ?? [] }];
      });
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

          <View style={styles.formContainer}>
            <ThemedText style={styles.label}>Nombre de la actividad:</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Ej. Escuela, Gimnasio..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={name}
              onChangeText={setName}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              text="Cerrar"
              style="secondary"
              onPress={handleClose}
            />

            <Button
              text={isSubmitting ? "Creando..." : "Crear"}
              style="main"
              onPress={handleCreateActivity}
              disabled={isSubmitting || !name.trim()}
            />
          </View>
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
      width: "92%",
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 24,
      borderRadius: 24,
      gap: 20,
      borderWidth: 1,
      borderColor: colors.light_accent,
    },
    formContainer: {
      gap: 12,
    },
    label: {
      fontSize: 14,
      opacity: 0.7,
    },
    input: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.text,
      borderColor: colors.light_accent,
      backgroundColor: colors.card,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 10,
    },
  })