import { Image } from "react-native";
import { StyleSheet } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function UserHeader() {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/profile.png')}
        style={styles.profilePicture}
      />
      <ThemedView style={styles.infoContainer}>
        <ThemedText type="subtitle">Manuel Magaña López</ThemedText>
        <ThemedText type="default">Estudiante de Software</ThemedText>
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'flex-start',
    gap: 8,
  },
  infoContainer: {
    flexDirection: 'column',
  },
  profilePicture: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
});
