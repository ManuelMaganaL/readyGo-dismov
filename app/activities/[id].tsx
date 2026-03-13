import React from "react";
import { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, TextInput, Pressable } from "react-native";
import { Square, CirclePlus, Trash2, ArrowLeft } from "lucide-react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";
import { useActivities } from "@/context/ActivitiesContext";
import LoaderSpinner from "@/components/loader-spinner";

import { 
  fetchCheckboxesByActivityId, 
  fetchActivityById,
  addCheckboxToActivity,
  deleteCheckbox,
} from "@/backend/activities";

import type { Activity } from "@/types";

export default function SingleActivityTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const { setMasterActivities } = useActivities();
  const styles = createStyles(colors);

  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [newDescription, setNewDescription] = useState("");

  // Obtenemos el ID de la ruta
  let { id } = useLocalSearchParams();
  if (typeof id !== "string") id = id[0];

  useEffect(() => {
    const fetchActivity = async () => {
      const activityData = await fetchActivityById(id);
      if (!activityData) {
        setActivity(null);
        setIsLoading(false);
        return;
      }
      
      const checkboxesData = await fetchCheckboxesByActivityId(id);
      if (!checkboxesData) {
        setActivity(null);
      } else {
        setActivity({
          id,
          user_id: activityData.user_id,
          name: activityData.name,
          created_at: activityData.created_at,
          checkboxes: checkboxesData,
        });
      }

      setIsLoading(false);
    }

    fetchActivity();
  }, [id]);

  const handleAddCheckbox = async () => {
    const trimmed = newDescription.trim();
    if (!trimmed) return;

    setNewDescription("");

    const newCheckbox = await addCheckboxToActivity(id, trimmed);
    if (!newCheckbox) return;
    setActivity((prev) =>
      prev
        ? { ...prev, checkboxes: [...prev.checkboxes, newCheckbox] }
        : prev
    );
    setMasterActivities((prev) =>
      prev.map((act) =>
        String(act.id) === String(id)
          ? { ...act, checkboxes: [...(act.checkboxes ?? []), newCheckbox] }
          : act
      )
    );
  };

  const handleDeleteCheckbox = async (checkboxId: string) => {
    const deletedCheckbox = await deleteCheckbox(checkboxId);
    if (!deletedCheckbox) return;
    setActivity((prev) =>
      prev
        ? {
            ...prev,
            checkboxes: prev.checkboxes.filter((cb) => cb.id !== checkboxId),
          }
        : prev
    );
    setMasterActivities((prev) =>
      prev.map((act) =>
        String(act.id) === String(id)
          ? {
              ...act,
              checkboxes: (act.checkboxes ?? []).filter((cb) => String(cb.id) !== String(checkboxId)),
            }
          : act
      )
    );
  };

  return (
    <>
      {isLoading ? (
        <LoaderSpinner />
      ) : (
        <ThemedView style={styles.container}>
          <ThemedView style={styles.titleContainer}>
            <Pressable onPress={() => {router.push("/activities")}}>
              <ArrowLeft color={colors.text} size={35}/>
            </Pressable>
            
            <ThemedText type="title" style={styles.title}>
              {activity?.name}
            </ThemedText>
          </ThemedView>
          
          {activity?.checkboxes.map((checkbox) => (
            <ThemedView key={checkbox.id} style={styles.checklistContainer}>
              <ThemedView style={styles.checklist}>
                <Square color={colors.accent}/>
                <ThemedText type="defaultSemiBold">{checkbox.description}</ThemedText>
              </ThemedView>

              <Pressable onPress={() => {handleDeleteCheckbox(checkbox.id)}}>
                <Trash2 color={colors.light_accent} size={20}/>
              </Pressable>
            </ThemedView>
          ))}

          <ThemedView style={styles.newCheckboxRow}>
            <CirclePlus color={colors.main} />
            <TextInput
              style={styles.input}
              placeholder="Agregar nuevo item a la lista"
              placeholderTextColor={colors.light_accent}
              value={newDescription}
              onChangeText={setNewDescription}
              returnKeyType="done"
              onSubmitEditing={handleAddCheckbox}
            />
          </ThemedView>
        </ThemedView>
      )}
    </>
  )
}

const createStyles = (colors: any) =>
StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 5,
  },
  title: {
    marginBottom: 8,
  },
  checklistContainer: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "space-between",
  },
  checklist: {
    flexDirection: "row",
    gap: 5,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  newCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.mid_accent,
  },
})
