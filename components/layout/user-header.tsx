import { Image } from "expo-image";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";

import type { UserHeaderProps } from "@/types";

const PLACEHOLDER_IMAGE = require('@/assets/images/profile.png');

export default function UserHeader({
  user,
  isSettings = false,
}: UserHeaderProps) {
  const router = useRouter();
  
  const { colors } = useTheme();
  const styles = createStyles(colors); 

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.userContainer}>
          <Skeleton width={60} height={60} borderRadius={30} />
          <ThemedView style={styles.infoContainer}>
            <Skeleton width={120} height={20} style={{ marginBottom: 6 }} />
            <Skeleton width={180} height={16} />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.userContainer}>
        <Image
          source={user.avatar_url ? { uri: user.avatar_url } : PLACEHOLDER_IMAGE}
          placeholder={PLACEHOLDER_IMAGE}
          contentFit="cover"
          transition={200}
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
          onPress={() => router.push({ pathname: '/edit-profile' })}
        />
      )}
    </ThemedView>
  )
}

const createStyles = (colors: any) => 
  StyleSheet.create({
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
