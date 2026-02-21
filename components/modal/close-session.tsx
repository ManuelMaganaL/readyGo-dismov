import { Modal, StyleSheet } from "react-native"
import { useRouter } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text"
import Button from "@/components/ui/button";

import { singOut } from "@/backend/session";

import type { CloseSessionModalProps } from "@/types";


export default function CloseSessionModal({
  isModalVisible,
  setIsModalVisible,
}: CloseSessionModalProps) {
  const router = useRouter();
  
  const handleAccept = async () => { 
    const success = await singOut()
    if (success) {
      setIsModalVisible(false);
      router.push("/auth/login");
    } else {
      console.error("Error signing out");
    }
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
            ¿Estás seguro que deseas cerrar la sesión?
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
              onPress={() => handleAccept()}
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