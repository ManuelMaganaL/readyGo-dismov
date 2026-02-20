import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/ui/button';

export default function AccountScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText>Pantalla de perfil de usuario</ThemedText>

      <Button
        text='Cerrar Sesión'
        style='danger'
        onPress={() => {router.replace('/auth/login');}}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
