import { Image } from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/button";

import type { UserHeaderProps } from "@/types";

export default function UserHeader({
  user,
  isSettings = false,
}: UserHeaderProps) {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.userContainer}>
        <Image
          source={require('@/assets/images/profile.png')}
          style={styles.profilePicture}
        />

        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">{user.username}</ThemedText>
          <ThemedText type="default">{user.email}</ThemedText>
        </ThemedView>
      </ThemedView>

      {isSettings && (
        <Button
          style="main"
          text="Editar"
          onPress={() => router.push('/edit-profile')}
        />
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userContainer: {
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
