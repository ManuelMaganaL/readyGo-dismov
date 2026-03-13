import { Image } from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/button";

import type { UserHeaderProps } from "@/types";

export default function UserHeader({
  user,
  isSettings = false,
}: UserHeaderProps) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [user.avatar_url]);

  const profileSource = !imageFailed && user.avatar_url
    ? { uri: user.avatar_url }
    : require('@/assets/images/profile.png');

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.userContainer}>
        <Image
          source={profileSource}
          style={styles.profilePicture}
          onError={() => setImageFailed(true)}
        />

        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">{user.username}</ThemedText>
          <ThemedText type="default">{user.email}</ThemedText>
        </ThemedView>
      </ThemedView>

      {isSettings && (
        <Button
          style="secondary"
          text="Editar"
          onPress={() => router.push({ pathname: '/edit-profile' })}
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
