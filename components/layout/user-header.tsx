import { Image } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/button";

import { getUserInfo } from "@/data/get-session";

import type { UserHeaderProps } from "@/types";

export default function UserHeader({
  isSettings = false,
}: UserHeaderProps) {
  const router = useRouter();

  const [username, setUsername] = useState<string>('Cargando...');
  const [email, setEmail] = useState<string>('Cargando...');

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const user = await getUserInfo();
      if (cancelled) return;

      if (user) {
        // Hace falta relacionar la tabla de auth.users con la 
        // tabla de public.users para obtener el nombre del usuario
        //
        // De momento siempre saldra Usuario
        setUsername('Usuario'); 
        setEmail(user.email ?? '');
      } else {
        setUsername('Usuario no autenticado');
        setEmail('Usuario no autenticado');
      }
    }

    loadUser();
    return () => { cancelled = true; };
  }, []);
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.userContainer}>
        <Image
          source={require('@/assets/images/profile.png')}
          style={styles.profilePicture}
        />

        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">{username}</ThemedText>
          <ThemedText type="default">{email}</ThemedText>
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
